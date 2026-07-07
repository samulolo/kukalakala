import hashlib
import json
from typing import Any, Optional

from core.setting import get_settings


class RedisService:

    def __init__(self, redis_url : Optional[str] = None):
        self.redis_url = redis_url or get_settings().redis_url
        self.client = self._create_client()

    def _create_client(self):

        try:
            from redis import Redis
        except ImportError:
            return None

        try:
            client = Redis.from_url(self.redis_url, decode_responses=True)
            client.ping()
            return client
        except Exception:
            return None

    def is_available(self) -> bool:
        return self.client is not None

    def build_file_hash(self, file_data : bytes) -> str:
        return hashlib.sha256(file_data).hexdigest()

    def get_json(self, key : str) -> Optional[Any]:

        if not self.client:
            return None

        value = self.client.get(key)

        if not value:
            return None

        return json.loads(value)

    def set_json(self, key : str, value : Any, ttl_seconds : int = 3600):

        if not self.client:
            return False

        self.client.setex(key, ttl_seconds, json.dumps(value, default=str))
        return True

    def delete_pattern(self, pattern : str):

        if not self.client:
            return 0

        deleted = 0

        for key in self.client.scan_iter(pattern):
            deleted += self.client.delete(key)

        return deleted
