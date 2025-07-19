import pandas as pd
import subprocess

# Load the CSV (must have a column named "email")
df = pd.read_csv('/Users/justingeorge/Documents/emails.csv')  # <-- replace with your actual filename/path

# Iterate and invoke the npm command for each address
for email in df['email']:
    try:
        # This will run: npm run invite-user <email>
        subprocess.run(
            ['npm', 'run', 'delete-user', email],
            input='y\n',
            text=True,
            check=True
        )
        print(f"✅ Deleted {email}")

        #print(f"npm run invite-user {email}")

    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to delete {email}: {e}")
