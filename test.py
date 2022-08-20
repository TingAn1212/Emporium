import hashlib
def hash(inp):
    h =  hashlib.md5(inp.encode())
    return h.hexdigest()
print(hash("12345678"))
