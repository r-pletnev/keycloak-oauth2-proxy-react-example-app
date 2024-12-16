from litestar import Controller, delete, get, post
from litestar.datastructures import ResponseHeader
from litestar.di import Provide
from app.post_models import Post
from app.post_service import PostService, post_service


class PostController(Controller):
    path = "/posts"
    dependencies = {"service": Provide(post_service)}

    @get(
        response_headers=[
            ResponseHeader(name="Content-Range", value="posts 0-9/13")
        ]
    )
    async def get_list_of_posts(
        self, service: PostService, headers: dict
    ) -> list[Post]:
        print(headers)
        return service.get_list()

    @get(path="/{id:int}")
    async def get_one_post(self, service: PostService, id: int) -> Post | None:
        return service.get_one(id)

    @delete(path="/{id:int}")
    async def delete_post(self, service: PostService, id: int) -> None:
        service.delete(id)

    @post()
    async def create_post(self, service: PostService, post: Post) -> Post:
        return service.create(post)

    @post(path="/{id:int}")
    async def update_post(self, service: PostService, post: Post) -> Post:
        return service.update(post)