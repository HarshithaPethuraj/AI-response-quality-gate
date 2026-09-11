from .models import ExecutionResult


class Store:
    def __init__(self):
        self._data: dict[str, ExecutionResult] = {}

    def save(self, r: ExecutionResult):
        self._data[r.id] = r

    def get(self, id: str):
        return self._data.get(id)

    def all(self):
        return list(self._data.values())

    def failures(self):
        return [r for r in self._data.values() if not r.passed]


store = Store()
