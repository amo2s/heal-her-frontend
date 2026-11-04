import os
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization

def generate_keypair():
    # 1. Generate Ed25519 Private Key
    private_key = ed25519.Ed25519PrivateKey.generate()
    public_key = private_key.public_key()

    # 2. Export PEM bytes
    priv_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")

    pub_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode("utf-8")

    # 3. Format strictly as single-line strings with escaped \n
    priv_single_line = priv_pem.strip().replace("\r\n", "\n").replace("\n", "\\n")
    pub_single_line = pub_pem.strip().replace("\r\n", "\n").replace("\n", "\\n")

    return priv_single_line, pub_single_line

def inject_keys():
    priv_key_str, pub_key_str = generate_keypair()

    # Mathematical round-trip verification
    priv_bytes = priv_key_str.replace("\\n", "\n").encode("utf-8")
    pub_bytes = pub_key_str.replace("\\n", "\n").encode("utf-8")

    loaded_priv = serialization.load_pem_private_key(priv_bytes, password=None)
    derived_pub = loaded_priv.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    loaded_pub = serialization.load_pem_public_key(pub_bytes).public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    assert derived_pub == loaded_pub, "FATAL: Derived public key does not match generated public key!"

    env_files = [
        ".env",
        "backend/legal_service/.env",
        "scripts/hf-secrets-uploader/.env",
        "production-secrets.local.txt",
    ]

    for rel_path in env_files:
        if not os.path.exists(rel_path):
            print(f"Skipping non-existent file: {rel_path}")
            continue

        with open(rel_path, "r", encoding="utf-8") as f:
            lines = f.readlines()

        # Filter out existing occurrences if any
        new_lines = [
            line for line in lines
            if not line.strip().startswith("TOS_EXECUTION_PRIVATE_KEY=")
            and not line.strip().startswith("TOS_EXECUTION_PUBLIC_KEY=")
        ]

        # Ensure newline at end
        if new_lines and not new_lines[-1].endswith("\n"):
            new_lines[-1] += "\n"

        new_lines.append(f'TOS_EXECUTION_PRIVATE_KEY="{priv_key_str}"\n')
        new_lines.append(f'TOS_EXECUTION_PUBLIC_KEY="{pub_key_str}"\n')

        with open(rel_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)

        print(f"Successfully injected execution keys into {rel_path}")

    # Final verification across all files
    for rel_path in env_files:
        if not os.path.exists(rel_path):
            continue
        with open(rel_path, "r", encoding="utf-8") as f:
            content = f.read()
        assert "TOS_EXECUTION_PRIVATE_KEY=" in content, f"Missing private key in {rel_path}"
        assert "TOS_EXECUTION_PUBLIC_KEY=" in content, f"Missing public key in {rel_path}"

    print("ALL ENVIRONMENT FILES INJECTED AND MATHEMATICALLY VERIFIED.")

if __name__ == "__main__":
    inject_keys()
