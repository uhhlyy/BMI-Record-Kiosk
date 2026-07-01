from pathlib import Path
import re

files = [
    Path(r"c:/Users/marti/OneDrive/Documents/IT Elective Lab/Martin_Lab5/index.html"),
    Path(r"c:/Users/marti/OneDrive/Documents/IT Elective Lab/Martin_Lab5/style.css"),
    Path(r"c:/Users/marti/OneDrive/Documents/IT Elective Lab/Martin_Lab5/script.js"),
]

for path in files:
    text = path.read_text(encoding="utf-8")
    if path.suffix.lower() == ".html":
        text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    elif path.suffix.lower() == ".css":
        text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    elif path.suffix.lower() == ".js":
        result = []
        i = 0
        in_single = False
        in_double = False
        in_template = False
        in_block = False
        in_line = False
        while i < len(text):
            ch = text[i]
            nxt = text[i + 1] if i + 1 < len(text) else ""
            if in_line:
                if ch == "\n":
                    in_line = False
                    result.append(ch)
                i += 1
                continue
            if in_block:
                if ch == "*" and nxt == "/":
                    in_block = False
                    i += 2
                else:
                    i += 1
                continue
            if in_single:
                result.append(ch)
                if ch == "\\":
                    if nxt:
                        result.append(nxt)
                        i += 2
                        continue
                if ch == "'":
                    in_single = False
                i += 1
                continue
            if in_double:
                result.append(ch)
                if ch == "\\":
                    if nxt:
                        result.append(nxt)
                        i += 2
                        continue
                if ch == '"':
                    in_double = False
                i += 1
                continue
            if in_template:
                result.append(ch)
                if ch == "\\":
                    if nxt:
                        result.append(nxt)
                        i += 2
                        continue
                if ch == "`":
                    in_template = False
                i += 1
                continue
            if ch == "'":
                in_single = True
                result.append(ch)
                i += 1
                continue
            if ch == '"':
                in_double = True
                result.append(ch)
                i += 1
                continue
            if ch == "`":
                in_template = True
                result.append(ch)
                i += 1
                continue
            if ch == "/" and nxt == "*":
                in_block = True
                i += 2
                continue
            if ch == "/" and nxt == "/":
                in_line = True
                i += 2
                continue
            result.append(ch)
            i += 1
        text = "".join(result)

    path.write_text(text, encoding="utf-8")
    print(f"Updated {path.name}")
