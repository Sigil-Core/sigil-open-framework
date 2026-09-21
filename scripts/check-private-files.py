"""Reject private credential artifacts without reading or logging their contents."""
import pathlib
import subprocess
import sys


def is_private(path):
    name = pathlib.PurePosixPath(path).name.lower()
    return (
        name in {"secrets.yaml", "secrets.yml", ".sops.yaml", ".sops.yml", ".age-key", ".gh-token"}
        or name.startswith(("secrets.yaml.", "secrets.yml."))
        or (name.startswith(".env") and name not in {".env.example", ".env.sample", ".env.template"})
    )


def main():
    paths = subprocess.check_output(["git", "ls-files", "-z"]).decode(errors="surrogateescape").split("\0")
    blocked = [path for path in paths if path and is_private(path)]
    if blocked:
        print("Private credential artifacts must not be tracked:", file=sys.stderr)
        for path in blocked:
            print(repr(path), file=sys.stderr)
        return 1
    print("No prohibited private credential artifacts are tracked.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
