import datetime
import time
from typing import Any

import pydantic


from backend.app.models import validatorFuncs


def validate_atleast_one_property_is_specified(values: dict[str, Any]):
    if not any(values.values()):
        raise ValueError("At least one property must be specified")
    else:
        return values


def validate_all_properties_are_specified(values: dict[str, Any]):
    if not all(values.values()):
        raise ValueError("All properties must be specified")
    else:
        return values


class IdCriteria(pydantic.BaseModel):
    id: int | None = None

    _validate_id = pydantic.validator("id", allow_reuse=True)(
        validatorFuncs.validate_64_bit_id
    )


class Id(pydantic.BaseModel):
    id: int

    _validate_id = pydantic.validator("id", allow_reuse=True)(
        validatorFuncs.validate_64_bit_id
    )


class Ids(pydantic.BaseModel):
    ids: tuple[int, ...]

    _validate_ids = pydantic.validator("ids", allow_reuse=True)(
        validatorFuncs.validate_64_bit_ids
    )


class SourceItem(pydantic.BaseModel):
    id: int
    item_type: str


class ItemLinks(pydantic.BaseModel):
    id: int
    item_type: str
    link_type: str | None = None
    source_items: tuple[SourceItem, ...]


class ItemsLinks(pydantic.BaseModel):
    items_links: tuple[ItemLinks, ...]


class PaginationBase(pydantic.BaseModel):
    cursor: str | None = None
    page_size: int | None = None
    sort_by: str | None = None

    @pydantic.root_validator()
    def validate_all(cls: "PaginationBase", values: dict[str, int | str | None]):
        return validate_all_properties_are_specified(values)

    @pydantic.validator("page_size", allow_reuse=True)
    def validate_page_size(cls: "PaginationBase", page_size: int | None):
        return validatorFuncs.validate_between_values(
            page_size, 2, validatorFuncs.ONE_LESS_64_BIT_INT, "page_size"
        )


class BasePropertiesCriteria(pydantic.BaseModel):
    created: tuple[datetime.datetime, datetime.datetime] | None = None
    exclude_created: bool = False
    last_modified: tuple[datetime.datetime, datetime.datetime] | None = None
    exclude_last_modified: bool = False
    deleted: bool | None = None


class PaginationBaseProperties(PaginationBase, BasePropertiesCriteria):
    deleted: bool | None = None

    @pydantic.root_validator()
    def validate_all(
        cls: "PaginationBaseProperties", values: dict[str, int | str | None]
    ):
        if values["cursor"] and values["cursor"].count(",") > 1:  # type: ignore
            raise ValueError(
                "sort_by can't have multiple properties when cursor is specified"
            )
        else:
            return values


def create_items_links(item_links: tuple[ItemLinks, ...]):
    return ItemsLinks(items_links=item_links)


def create_base_property_criterias(
    item_type: str,
    item: PaginationBaseProperties | IdCriteria,
):
    return (
        create_id_string(item_type, item.id),
        create_datetime_datetime_string(
            item_type, "created", item.created, item.exclude_created
        ),
        create_datetime_datetime_string(
            item_type, "last_modified", item.last_modified, item.exclude_last_modified
        ),
        create_deleted_criteria_string(item_type, item.deleted),
    )


def create_similar_to_string(
    item_type: str, property: str, value: str | None, exclude: bool = False
):
    statement = f"{item_type}.{property} SIMILAR TO '%{value}%'" if value else ""
    return wrap_statement_if_exclude_string(statement, exclude)


def create_equals_string_string(
    item_type: str, property: str, value: str | None, exclude: bool = False
):
    statement = f"{item_type}.{property} = '{value}'" if value else ""
    return wrap_statement_if_exclude_string(statement, exclude)


def create_equals_non_string_string(
    item_type: str, property: str, value: Any, exclude: bool = False
):
    statement = f"{item_type}.{property} = {value}" if value is not None else ""
    return wrap_statement_if_exclude_string(statement, exclude)


def create_id_string(item_type: str, id: int):
    return f"{item_type}.id = {id}" if id else ""


def create_datetime_datetime_string(
    item_type: str,
    property: str,
    range: tuple[datetime.datetime, datetime.datetime]
    | tuple[time.struct_time, time.struct_time]
    | None,
    exclude: bool = False,
):
    base_str = f"{item_type}.{property}"
    statement = (
        (f"{base_str} >= '{range[0]}' AND {base_str} <= '{range[1]}'")
        if range is not None
        else ""
    )
    return wrap_statement_if_exclude_string(statement, exclude)


def wrap_statement_if_exclude_string(statement: str, exclude: bool):
    return f"NOT ({statement})" if statement and exclude else statement


def create_deleted_criteria_string(item_type: str, deleted: bool | None):
    return f"({item_type}.deleted = {deleted})" if deleted is not None else ""


def create_sort_by(item_type: str, sort_by: str | None):
    sort_by_string = ""
    if sort_by:
        sort_by_list = sort_by.split(",")
        for sort_by_index, sort_by_value in enumerate(sort_by_list):
            comma_string = ", " if sort_by_index > 0 else ""
            sort_by_string += f"{comma_string}{item_type}.{sort_by_value.strip()}"
    return f"{sort_by_string}" if sort_by else None


def create_two_way_item_links(
    individual_id: int,
    individual_type: str,
    individual_link_type: str | None,
    multiple_ids: tuple[int, ...] | None,
    multiple_type: str,
    multiple_link_type: str | None,
):
    if multiple_ids:
        individual_item_links = create_item_links(
            individual_id,
            individual_type,
            individual_link_type,
            multiple_ids,
            multiple_type,
        )
        multiple_items_links = tuple(
            create_item_links(
                multiple_id,
                multiple_type,
                multiple_link_type,
                (individual_id,),
                individual_type,
            )
            for multiple_id in multiple_ids
        )
        combined_item_links = tuple(
            item for item in (individual_item_links, *multiple_items_links) if item
        )
        return combined_item_links or None
    else:
        return None


def create_item_links(
    destination_id: int,
    destination_item_type: str,
    destination_link_type: str | None,
    source_ids: tuple[int, ...],
    source_item_type: str,
):
    source_items = tuple(
        SourceItem(id=id, item_type=source_item_type) for id in source_ids
    )
    return ItemLinks(
        id=destination_id,
        item_type=destination_item_type,
        link_type=destination_link_type,
        source_items=source_items,
    )
