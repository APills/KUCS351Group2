from fastapi import APIRouter


from app.database.repositories.users import funcs as userFuncs, models as userModels  # type: ignore

router = APIRouter()

@router.post("/token", response_model=userModels.Token)
def login_for_access_token(
    form_data: authenciation
)