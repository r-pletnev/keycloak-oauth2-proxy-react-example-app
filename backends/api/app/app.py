from litestar import Litestar, get

from app.post_controller import PostController


app = Litestar(route_handlers=[PostController])
