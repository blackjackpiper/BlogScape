from fastapi import FastAPI, HTTPException, Query, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from bson import ObjectId
import os
import requests
from dotenv import load_dotenv

from auth import hash_password, verify_password, create_token, decode_token, get_current_user
from models import UserSignup, UserLogin, Blog
from database import users_collection, blogs_collection

# Load environment variables
load_dotenv()
origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

app = FastAPI()
router = APIRouter()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security scheme
security = HTTPBearer()

# SERPAPI Configuration
SERPAPI_KEY = os.getenv("SERPAPI_KEY")
TRENDS_API_URL = "https://serpapi.com/search.json"
print("🔐 Loaded SERPAPI_KEY:", os.getenv("SERPAPI_KEY"))

# ✅ TRENDING ROUTE FIXED
@app.get("/trends")
def get_trends(geo: str = "US", hours: int = 24):
    try:
        params = {
            "engine": "google_trends_trending_now",
            "api_key": SERPAPI_KEY,
            "geo": geo,
            "hours": hours
        }
        response = requests.get(TRENDS_API_URL, params=params)
        response.raise_for_status()
        data = response.json()

        trending_raw = data.get("trending_searches", [])
        trends = []
        for i, item in enumerate(trending_raw, start=1):
            title = item.get("query", "No title")
            volume = item.get("search_volume", 0)
            traffic = f"{int(volume / 1000000)}M+" if volume else "N/A"
            url = f"https://www.google.com/search?q={title.replace(' ', '+')}"
            trends.append({
                "rank": i,
                "title": title,
                "traffic": traffic,
                "url": url
            })

        return {"trends": trends}

    except requests.exceptions.RequestException as e:
        print("SerpApi Error:", e)
        return {"trends": []}



# ------------------- AUTH ROUTES -------------------

@app.post("/signup")
def signup(user: UserSignup = Depends(UserSignup.as_form)):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password)
    users_collection.insert_one(user_dict)

    return {"msg": "User registered successfully"}


@app.post("/login")
def login(user: UserLogin = Depends(UserLogin.as_form)):
    user_in_db = users_collection.find_one({"email": user.email})
    
    if not user_in_db or not verify_password(user.password, user_in_db["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token({"email": user.email, "username": user_in_db["username"]})
    return {"token": token}


# ------------------- BLOG ROUTES -------------------

@app.get("/blogs")
def get_blogs(user=Depends(get_current_user)):
    user_email = user["email"]
    blogs = blogs_collection.find({"email": user_email})
    return [
        {
            "id": str(blog["_id"]),
            "title": blog["title"],
            "content": blog["content"],
            "public": blog.get("public", True),
            "likes": blog.get("likes", 0)
        }
        for blog in blogs
    ]


@app.get("/blogs/public")
def get_public_blogs():
    blogs = blogs_collection.find({"public": True})
    return [
        {
            "id": str(blog["_id"]),
            "title": blog["title"],
            "content": blog["content"],
            "likes": blog.get("likes", 0),
            "email": blog["email"], 
            "author": users_collection.find_one({"email": blog["email"]})["username"]
        }
        for blog in blogs
    ]


@app.post("/blogs")
def create_blog(blog: Blog = Depends(Blog.as_form), user=Depends(get_current_user)):
    blog_data = blog.dict()
    blog_data["email"] = user["email"]
    blog_data["likes"] = 0
    blog_data["likers"] = []
    blogs_collection.insert_one(blog_data)
    return {"msg": "Blog created"}


from fastapi import Request  # ✅ Add this at the top if not already

@app.post("/blogs/{blog_id}/like")
def like_blog(blog_id: str, user=Depends(get_current_user)):
    blog = blogs_collection.find_one({"_id": ObjectId(blog_id)})
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    user_email = user["email"]
    likers = blog.get("likers", [])

    if user_email in likers:
        return {"msg": "Already liked"}

    blogs_collection.update_one(
        {"_id": ObjectId(blog_id)},
        {
            "$inc": {"likes": 1},
            "$addToSet": {"likers": user_email}  # ✅ ensure no duplicates
        }
    )

    return {"msg": "Liked"}


@app.put("/blogs/{blog_id}")
def update_blog(blog_id: str, blog: Blog = Depends(Blog.as_form), user=Depends(get_current_user)):
    result = blogs_collection.update_one(
        {"_id": ObjectId(blog_id), "email": user["email"]},
        {"$set": blog.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"msg": "Blog updated"}


@app.delete("/blogs/{blog_id}")
def delete_blog(blog_id: str, user=Depends(get_current_user)):
    result = blogs_collection.delete_one(
        {"_id": ObjectId(blog_id), "email": user["email"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"msg": "Blog deleted"}

@app.get("/blogs/{blog_id}/similar")
async def get_similar_blogs(blog_id: str):
    all_blogs = list(blogs_collection.find({}, {"_id": 1, "title": 1, "content": 1}))
    if not all_blogs:
        raise HTTPException(status_code=404, detail="No blogs found")

    blog_ids = [str(blog["_id"]) for blog in all_blogs]
    contents = [blog["content"] for blog in all_blogs]

    # Find target blog index
    if blog_id not in blog_ids:
        raise HTTPException(status_code=404, detail="Blog not found")
    target_index = blog_ids.index(blog_id)

    # Vectorize using TF-IDF
    tfidf = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf.fit_transform(contents)

    # Compute cosine similarity
    cosine_sim = cosine_similarity(tfidf_matrix[target_index], tfidf_matrix).flatten()

    # Get top 3 similar blogs (excluding the current one)
    similar_indices = cosine_sim.argsort()[-4:-1][::-1]
    similar_blogs = []

    for idx in similar_indices:
        blog = all_blogs[idx]
        similar_blogs.append({
            "id": str(blog["_id"]),
            "title": blog["title"],
            "preview": blog["content"][:100] + "..."
        })

    return similar_blogs
