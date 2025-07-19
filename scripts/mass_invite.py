import pandas as pd
import subprocess

# Load the CSV (must have a column named "email")
df = pd.read_csv('/Users/justingeorge/Documents/emails.csv')  # <-- replace with your actual filename/path

# Iterate and invoke the npm command for each address
for email in df['email']:
    try:
        # This will run: npm run invite-user <email>
        subprocess.run(
            ['npm', 'run', 'invite-user', email],
            check=True
        )
        print(f"✅ Invited {email}")

        #print(f"npm run invite-user {email}")

    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to invite {email}: {e}")
