import json
from pydantic import TypeAdapter
from app.post_models import Post


class PostService:
    def __init__(self, data_path: str) -> None:
        with open(data_path) as f:
            posts = json.load(f)["posts"]
            self.posts = [
                TypeAdapter(Post).validate_python(post_dict)
                for post_dict in posts
            ]

    def get_list(self) -> list[Post]:
        return self.posts

    def get_one(self, id: int) -> Post | None:
        for post in self.posts:
            if post.id == id:
                return post

    def get_many(self, ids: list[int]) -> list[Post]:
        results: list[Post] = []
        for id in ids:
            for post in self.posts:
                if post.id == id:
                    results.append(post)
        return results

    def create(self, post: Post) -> Post:
        self.posts.append(post)
        return post

    def update(self, post: Post) -> Post:
        for i in range(len(self.posts)):
            if self.posts[i].id == post.id:
                self.posts[i] = post
                break
        return post

    def delete(self, id: int) -> None:
        for i in range(len(self.posts)):
            if self.posts[i].id == id:
                del self.posts[i]
                break


post_service = lambda: PostService("./app/posts.json")
