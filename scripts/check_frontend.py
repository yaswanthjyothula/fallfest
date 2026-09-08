import os

frontend_dir = "frontend"
for root, dirs, files in os.walk(frontend_dir):
    if "node_modules" in dirs:
        dirs.remove("node_modules")
    if ".next" in dirs:
        dirs.remove(".next")
    for f in files:
        if f.endswith((".tsx", ".ts", ".jsx", ".js")):
            p = os.path.join(root, f)
            with open(p, "r", encoding="utf-8") as file:
                content = file.read()
                # Check for string literals containing <div or <span or <svg
                if '"<div' in content or "'<div" in content or "`<div" in content:
                    print("HTML string found in:", p)
                if '"<svg' in content or "'<svg" in content or "`<svg" in content:
                    print("SVG string found in:", p)
                if "JSON.stringify" in content:
                    # check if JSON.stringify is rendered in JSX
                    for line in content.splitlines():
                        if "JSON.stringify" in line:
                            print(f"JSON.stringify in {p}: {line.strip()}")
