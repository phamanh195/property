from __future__ import absolute_import, unicode_literals
import environ

environ.Env.read_env('environments.env')

from .base import *
from .app import *
from .db import *
from .general import *
from .email import *
from .tinymce import *

if not ENVIRONMENT == 'dev':
    from .production import *
else:
    from .development import *
