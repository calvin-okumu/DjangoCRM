"""
DjangoCRM Logging Configuration

This module provides comprehensive logging setup for the DjangoCRM application.
Includes automatic directory creation, detailed formatters, and specific loggers
for Django components and application modules.
"""

import logging
import logging.handlers
from pathlib import Path


def setup_logging(base_dir: Path) -> dict:
    """
    Sets up comprehensive logging configuration for DjangoCRM.

    Args:
        base_dir: Base directory path for the Django project

    Returns:
        dict: Logging configuration dictionary for Django settings
    """

    # Ensure logs directory exists
    logs_dir = base_dir.parent / 'logs' / 'backend'
    logs_dir.mkdir(parents=True, exist_ok=True)

    # Logging formatters
    formatters = {
        'verbose': {
            'format': '{levelname} {asctime} {module} {filename} {lineno:d} {funcName} {process:d} {thread:d} {message}',
            'style': '{',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
        'simple': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
    }

    # Logging filters for level separation
    filters = {
        'info_only': {
            '()': 'django.utils.log.CallbackFilter',
            'callback': lambda record: record.levelno == 20,  # INFO
        },
        'warning_only': {
            '()': 'django.utils.log.CallbackFilter',
            'callback': lambda record: record.levelno == 30,  # WARNING
        },
        'error_only': {
            '()': 'django.utils.log.CallbackFilter',
            'callback': lambda record: record.levelno >= 40,  # ERROR and above
        },
    }

    # Logging handlers
    handlers = {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
            'level': 'INFO',
        },
        'info_file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': logs_dir / 'info.log',
            'formatter': 'verbose',
            'filters': ['info_only'],
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5,
        },
        'warning_file': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': logs_dir / 'warning.log',
            'formatter': 'verbose',
            'filters': ['warning_only'],
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5,
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': logs_dir / 'error.log',
            'formatter': 'verbose',
            'filters': ['error_only'],
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5,
        },
    }

    # Logging loggers for specific components
    loggers = {
        # Django framework loggers
        'django': {
            'handlers': ['console', 'info_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['warning_file', 'error_file'],
            'level': 'WARNING',
            'propagate': False,
        },
        'django.template': {
            'handlers': ['error_file'],
            'level': 'ERROR',
            'propagate': False,
        },
        'django.server': {
            'handlers': ['console', 'info_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['warning_file', 'error_file'],
            'level': 'WARNING',
            'propagate': False,
        },

        # Django REST Framework loggers
        'rest_framework': {
            'handlers': ['info_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'rest_framework.request': {
            'handlers': ['warning_file', 'error_file'],
            'level': 'WARNING',
            'propagate': False,
        },

        # Application-specific loggers
        'accounts': {
            'handlers': ['info_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'project': {
            'handlers': ['info_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'project.signals': {
            'handlers': ['info_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'project.middleware': {
            'handlers': ['info_file'],
            'level': 'INFO',
            'propagate': False,
        },

        # Third-party package loggers
        'allauth': {
            'handlers': ['info_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'corsheaders': {
            'handlers': ['warning_file'],
            'level': 'WARNING',
            'propagate': False,
        },
    }

    return {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': formatters,
        'filters': filters,
        'handlers': handlers,
        'loggers': loggers,
        'root': {
            'handlers': ['console', 'info_file', 'warning_file', 'error_file'],
            'level': 'INFO',
        },
    }