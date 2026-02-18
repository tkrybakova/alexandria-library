from models.permission import Permission

def seed_permissions(db):
    permissions = [
        Permission(
            action="view_profile",
            allowed_roles="user,teacher,pre-admin,platform-admin",
        ),
        Permission(
            action="create_course",
            allowed_roles="teacher,pre-admin,platform-admin",
        ),
        Permission(
            action="manage_faculty",
            allowed_roles="pre-admin,platform-admin",
        ),
        Permission(
            action="manage_organization",
            allowed_roles="platform-admin",
        ),
    ]

    db.add_all(permissions)
    db.commit()
