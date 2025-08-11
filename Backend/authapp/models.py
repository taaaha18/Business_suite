from django.db import models

class BaseUser(models.Model):
    full_name = models.CharField(max_length=100)
    email = models.EmailField(primary_key=True)
    password = models.CharField(max_length=255)

    class Meta:
        abstract = True

class Admin(BaseUser):
    pass

class Assistant(BaseUser):
    pass

class Manager(BaseUser):
    pass

class Developer(BaseUser):
    pass

class Designer(BaseUser):
    pass
