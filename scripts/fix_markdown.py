import ast

with open("app.py", "r", encoding="utf-8") as f:
    source = f.read()

tree = ast.parse(source)

# We want to find calls to st.markdown
calls_to_fix = []

for node in ast.walk(tree):
    if isinstance(node, ast.Call):
        # check if func is st.markdown
        is_st_markdown = False
        if isinstance(node.func, ast.Attribute) and node.func.attr == "markdown":
            if isinstance(node.func.value, ast.Name) and node.func.value.id == "st":
                is_st_markdown = True
        
        if is_st_markdown:
            has_unsafe = any(kw.arg == "unsafe_allow_html" for kw in node.keywords)
            if not has_unsafe:
                # Check if first arg contains '<'
                first_arg = node.args[0] if node.args else None
                contains_html = False
                if isinstance(first_arg, ast.Constant) and isinstance(first_arg.value, str):
                    if "<" in first_arg.value and ">" in first_arg.value:
                        contains_html = True
                elif isinstance(first_arg, ast.JoinedStr): # f-string
                    for part in first_arg.values:
                        if isinstance(part, ast.Constant) and isinstance(part.value, str):
                            if "<" in part.value and ">" in part.value:
                                contains_html = True
                
                if contains_html:
                    calls_to_fix.append((node.lineno, node.end_lineno, node.col_offset, node.end_col_offset))

print(f"Found {len(calls_to_fix)} st.markdown calls missing unsafe_allow_html=True")

lines = source.splitlines(keepends=True)

# Process in reverse line order so line numbers remain valid
for start_line, end_line, col_start, col_end in sorted(calls_to_fix, key=lambda x: x[0], reverse=True):
    # lines are 1-indexed
    call_text = "".join(lines[start_line - 1 : end_line])
    # find the last closing parenthesis
    last_paren = call_text.rfind(")")
    if last_paren != -1:
        # Check if preceded by comma
        before_paren = call_text[:last_paren].rstrip()
        indent = " " * (col_start + 4)
        if before_paren.endswith(","):
            new_call = before_paren + f"\n{indent}unsafe_allow_html=True,\n" + (" " * col_start) + ")" + call_text[last_paren+1:]
        else:
            new_call = before_paren + f",\n{indent}unsafe_allow_html=True,\n" + (" " * col_start) + ")" + call_text[last_paren+1:]
        
        # Replace the slice of lines
        lines[start_line - 1 : end_line] = [new_call]

new_source = "".join(lines)
# Validate syntax
ast.parse(new_source)
print("Syntax validated successfully!")

with open("app.py", "w", encoding="utf-8") as f:
    f.write(new_source)

print("Saved app.py with all unsafe_allow_html=True fixed!")
