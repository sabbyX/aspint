import asyncio
import logging

import structlog


def configure_logger(enable_json_logs: bool = False):
    timestamper = structlog.processors.TimeStamper(fmt="%Y-%m-%d %H:%M:%S")

    shared_processors = [
        timestamper,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.contextvars.merge_contextvars,
        structlog.processors.CallsiteParameterAdder(
            {
                structlog.processors.CallsiteParameter.FILENAME,
                structlog.processors.CallsiteParameter.MODULE,
                structlog.processors.CallsiteParameter.FUNC_NAME,
            }
        ),
        structlog.stdlib.ExtraAdder(),
    ]

    structlog.configure(
        processors=shared_processors
        + [structlog.stdlib.ProcessorFormatter.wrap_for_formatter],
        logger_factory=structlog.stdlib.LoggerFactory(),
        # call log with await syntax in thread pool executor
        wrapper_class=structlog.stdlib.AsyncBoundLogger,
        cache_logger_on_first_use=True,
    )

    logs_render = (
        structlog.processors.JSONRenderer()
        if enable_json_logs
        else structlog.dev.ConsoleRenderer(colors=True)
    )

    _configure_default_logging_by_custom(shared_processors, logs_render)


def _configure_default_logging_by_custom(shared_processors, logs_render):
    handler = logging.StreamHandler()

    # Use `ProcessorFormatter` to format all `logging` entries.
    formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processors=[
            _extract_from_record,
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            logs_render,
        ],
    )

    handler.setFormatter(formatter)
    root_uvicorn_logger = logging.getLogger()
    root_uvicorn_logger.addHandler(handler)
    root_uvicorn_logger.setLevel(logging.DEBUG)


def _extract_from_record(_, __, event_dict):
    # Extract thread and process names and add them to the event dict.
    record = event_dict["_record"]
    event_dict["thread_name"] = record.threadName
    event_dict["process_name"] = record.processName
    return event_dict
