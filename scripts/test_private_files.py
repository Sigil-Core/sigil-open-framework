"""Exercise the gate against real Git indexes, without credential contents."""
import pathlib
import subprocess
import sys
import tempfile
import unittest

GATE = pathlib.Path(__file__).with_name("check-private-files.py").resolve()


class PrivateFilesTest(unittest.TestCase):
    def check_paths(self, paths, expected):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            subprocess.run(["git", "init", "-q", directory], check=True)
            for name in paths:
                file = root / name
                file.parent.mkdir(parents=True, exist_ok=True)
                file.write_text("synthetic fixture\n")
            subprocess.run(["git", "add", "--all"], cwd=root, check=True)
            result = subprocess.run([sys.executable, str(GATE)], cwd=root,
                                    capture_output=True, text=True)
            self.assertEqual(result.returncode, expected, result.stderr)
            self.assertNotIn("synthetic fixture", result.stdout + result.stderr)
            return result

    def test_prohibited_paths(self):
        for name in ("secrets.yaml", "nested/SECRETS.YML", ".sops.yaml",
                     "nested/.sops.yml", ".age-key", ".gh-token",
                     "secrets.yaml.backup", "secrets.yml.old", ".env",
                     "nested/.env.production", "nested/.env.local"):
            with self.subTest(name=name):
                result = self.check_paths([name], 1)
                self.assertIn(repr(name), result.stderr)

    def test_templates_and_ordinary_files(self):
        self.check_paths(["README.md", ".env.example", "nested/.env.sample",
                          ".env.template", "config.yaml"], 0)

    def test_non_utf8_path_does_not_hide_blocked_file(self):
        result = self.check_paths(["odd-\udcff.txt", "nested/secrets.yaml"], 1)
        self.assertIn("nested/secrets.yaml", result.stderr)
        self.assertNotIn("Traceback", result.stderr)


if __name__ == "__main__":
    unittest.main()
