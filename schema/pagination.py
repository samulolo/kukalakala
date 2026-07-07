
def serialize_response(item, response_schema = None):
    if response_schema:
        return response_schema.model_validate(item).model_dump(mode="json")

    return item.model_dump(mode="json")


def paginate_response(items, total : int, page : int, limit : int, response_schema = None):
    pages = (total + limit - 1) // limit if limit else 0

    return {
        "items": [serialize_response(item, response_schema) for item in items],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": pages
        }
    }
