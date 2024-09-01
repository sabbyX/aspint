from redis.asyncio.connection import ConnectionPool


def create_redis():
    return ConnectionPool(
        host='redis',
        port=6379,
        decode_responses=True,
    )


pool = create_redis()
