import datetime

import pydantic

from backend.app.models import validatorFuncs, baseModels


class Token(pydantic.BaseModel):
    access_token: str
    token_type: str


class TokenData(pydantic.BaseModel):
    username: str | None = None


class UserBase(pydantic.BaseModel):
    full_name: str
    username: str
    description: str | None = None

    _validate_first_name = pydantic.validator("full_name", allow_reuse=True)(
        validatorFuncs.validate_string_name
    )
    _validate_username = pydantic.validator("username", allow_reuse=True)(
        validatorFuncs.validate_string_name
    )
    _validate_description = pydantic.validator("description", allow_reuse=True)(
        validatorFuncs.validate_string_passage
    )


class User(UserBase, baseModels.Id):
    created: datetime.datetime
    last_modified: datetime.datetime
    deleted: bool


class UserInDB(User):
    hashed_password: str


class UserCreate(UserBase):
    password: str

    _validate_password = pydantic.validator("password", allow_reuse=True)(
        validatorFuncs.validate_string_name
    )


class UsersCreate(pydantic.BaseModel):
    users: tuple[UserCreate, ...]


class UserUpdateToDB(pydantic.BaseModel):
    full_name: str | None = None
    password: str | None = None
    description: str | None = None

    @pydantic.root_validator()
    def validate_any_values_are_specified(
        cls: "UserUpdateToDB", values: dict[str, str | None]
    ):
        if not any(values.values()):
            raise ValueError("At least one property must be specified")
        else:
            return values

    _validate_first_name = pydantic.validator("full_name", allow_reuse=True)(
        validatorFuncs.validate_string_name
    )
    _validate_password = pydantic.validator("password", allow_reuse=True)(
        validatorFuncs.validate_string_name
    )
    _validate_description = pydantic.validator("description", allow_reuse=True)(
        validatorFuncs.validate_string_passage
    )


class UserUpdate(baseModels.Id, UserUpdateToDB):
    pass


class UserToDB(UserBase):
    hashed_password: str


class SupervisorEmployeeCriteria(pydantic.BaseModel):
    supervisor_id: int | None = None
    employee_id: int | None = None

    _validate_supervisor_id = pydantic.validator("supervisor_id", allow_reuse=True)(
        validatorFuncs.validate_64_bit_id
    )
    _validate_employee_id = pydantic.validator("employee_id", allow_reuse=True)(
        validatorFuncs.validate_64_bit_id
    )

    @pydantic.root_validator()
    def validate_all(
        cls: "SupervisorEmployeeCriteria",
        values: dict[str, str | tuple[int, ...] | datetime.datetime | bool | None],
    ):
        if values["supervisor_id"] and values["employee_id"]:
            raise ValueError("supervisor_id and employee_id are mutually exclusive")
        else:
            return values


class UserCriteria(
    SupervisorEmployeeCriteria,
    generalModels.IdCriteria,
    generalModels.PaginationBaseProperties,
):
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None
    title: str | None = None

    exclude_first_name: bool = False
    exclude_last_name: bool = False
    exclude_username: bool = False
    exclude_title: bool = False
    exclude_supervisor_id: bool = False
    exclude_employee_id: bool = False

    _validate_full_name = pydantic.validator("full_name", allow_reuse=True)(
        validatorFuncs.validate_string_name
    )
    _validate_username = pydantic.validator("username", allow_reuse=True)(
        validatorFuncs.validate_string_name
    )
    _validate_description = pydantic.validator("description", allow_reuse=True)(
        validatorFuncs.validate_string_passage
    )
