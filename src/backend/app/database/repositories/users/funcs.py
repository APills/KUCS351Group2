from app.database.repositories.users import models as userModels
from app.models import generalModels
from app.services import authentication  # type: ignore
from app.database.repositories import storageEndpointFuncs  # type: ignore
from app.database.repositories.titles import funcs as titleFuncs, models as titleModels
from app.database.repositories.currentState import funcs as currentStateFuncs
from app.database.repositories.currentState import models as currentStateModels


item_type = "user"


def get_users(user_criteria: userModels.UserCriteria, logging_in: bool = False):
    criteria = create_user_criteria_string(user_criteria, logging_in)
    sort_by = generalModels.create_sort_by(item_type, user_criteria.sort_by)
    if user_criteria.supervisor_id:
        return_schema = None
        link_criteria = (
            f"[{user_criteria.supervisor_id}]->(<employee>,{{{item_type}:[*]}})"
        )
    elif user_criteria.employee_id:
        return_schema = None
        link_criteria = (
            f"[{user_criteria.employee_id}]->(<supervisor>,{{{item_type}:[*]}})"
        )
    else:
        if logging_in:
            return_schema = f"{{{item_type}:[*]}}"
        else:
            return_schema = f"{{{item_type}:[id,created,last_modified,deleted,first_name,last_name,username,title]}}"
        link_criteria = None

    return storageEndpointFuncs.get_items(
        item_type,
        return_schema,
        criteria,
        link_criteria,
        user_criteria.cursor,
        user_criteria.page_size,
        sort_by,
    )


def create_user_criteria_string(
    user_criteria: userModels.UserCriteria, logging_in: bool
):
    criteria_tuple = (
        generalModels.create_similar_to_string(
            item_type,
            "first_name",
            user_criteria.first_name,
            user_criteria.exclude_first_name,
        ),
        generalModels.create_similar_to_string(
            item_type,
            "last_name",
            user_criteria.last_name,
            user_criteria.exclude_last_name,
        ),
        create_username_criteria_string(
            user_criteria.username, logging_in, user_criteria.exclude_username
        ),
        create_title_criteria_string(user_criteria.title, user_criteria.exclude_title),
        generalModels.create_equals_non_string_string(
            item_type, "deleted", user_criteria.deleted
        ),
        *generalModels.create_base_property_criterias(item_type, user_criteria),
    )
    criterias = tuple(criteria for criteria in criteria_tuple if criteria)
    return " AND ".join(criterias) if criterias else None


def create_username_criteria_string(
    username: str | None, logging_in: bool, exclude: bool = False
):
    if logging_in:
        statement = f"({item_type}.username = '{username}')"
    else:
        statement = (
            f"({item_type}.username SIMILAR TO '%{username}%')" if username else ""
        )
    return generalModels.wrap_statement_if_exclude_string(statement, exclude)


def create_title_criteria_string(title: str | None, exclude: bool = False):
    if title:
        titleFuncs.get_titles(titleModels.TitleCriteria(name=title))
        statement = generalModels.create_similar_to_string(item_type, "title", title)
    else:
        statement = ""
    return generalModels.wrap_statement_if_exclude_string(statement, exclude)


def create_users(users: userModels.UsersCreate, return_results: bool = False):
    users_to_db = tuple(create_user_to_db(user) for user in users.users)
    item_results = storageEndpointFuncs.post_items(item_type, users_to_db, True)
    for item_result in item_results:
        current_state = currentStateModels.CurrentStateCriteria(
            user_id=item_result["id"]
        )
        currentStateFuncs.create_current_state(current_state)
    if return_results:
        return tuple(
            {
                key: value
                for key, value in item_result.items()
                if key != "hashed_password"
            }
            for item_result in item_results
        )
    else:
        return None


def create_user_to_db(user: userModels.UserCreate):
    titleFuncs.get_titles(titleModels.TitleCriteria(name=user.title))
    hashed_password = authentication.hash_password(user.password)
    combined_user = user.dict() | {"hashed_password": hashed_password}
    return userModels.UserToDB(**combined_user)


def update_user(user: userModels.UserUpdate, return_results: bool = True):
    user_to_db = create_user_update_to_db(user)
    return storageEndpointFuncs.update_item(
        user.id, item_type, user_to_db, return_results
    )


def create_user_update_to_db(
    user: userModels.UserUpdate,
):
    if user.password:
        hashed_password = authentication.hash_password(user.password)
        combined_user = user.dict(exclude_none=True) | {
            "hashed_password": hashed_password
        }
    else:
        combined_user = user.dict(exclude_none=True)
    return userModels.UserUpdateToDB(**combined_user)


def delete_user(
    user_id: generalModels.Id, delete: bool = True, return_results: bool = True
):
    ids = generalModels.Ids(ids=(user_id.id,))
    currentStateFuncs.delete_current_state(user_id, delete)
    return storageEndpointFuncs.delete_items(item_type, ids, delete, return_results)
