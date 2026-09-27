"""
Email Sender Bot
Reads master_leads.csv and sends cold emails via Gmail.
- Leads WITH a website get Template A
- Leads WITHOUT a website get Template B
- Marks each lead as "sent" in the CSV so it never emails the same person twice

SETUP:
    1. Turn on Gmail App Password:
       - Go to myaccount.google.com/security
       - Enable 2-Step Verification if not already on
       - Go to myaccount.google.com/apppasswords
       - Create a new app password → copy it → paste below

    2. Fill in YOUR_EMAIL, YOUR_APP_PASSWORD, YOUR_NAME, YOUR_WEBSITE below

RUN:
    python3 email_sender.py
"""

import csv
import smtplib
import time
import os
import random
import shutil
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

# ============================================================
# CONFIG — FILL THESE IN BEFORE RUNNING
# ============================================================
YOUR_EMAIL        = "nithinselvaraj20@gmail.com"       # Your Gmail address
YOUR_APP_PASSWORD = "njtl nbkn uflk ogdy"       # Gmail App Password (not your login password)
YOUR_NAME         = "Nithin "                 # Your name e.g. Nithin

CSV_FILE          = "master_leads.csv"          # Your leads file

# Delay between emails in seconds (min, max)
# Sending too fast = Gmail flags you as spam
# Recommended: 30-60 seconds between each email
DELAY_MIN = 30
DELAY_MAX = 60

# ============================================================
# EMAIL TEMPLATE A — For leads WHO HAVE a website
# Their site exists but probably looks bad — offer to revamp it
# ============================================================
def template_with_website(name, business_type, website):
    recipient_name = name if name else "there"
    subject = "Quick idea for your website"
    body = f"""Hi,

I had a look at your website and it's good, but it could feel more modern and visually engaging.

Right now, many businesses are upgrading to sleek, high-end websites with smooth animations and even 3D elements to create a stronger first impression.

I help upgrade existing websites into something more modern, clean, and premium-looking — without making things complicated.

If you're open to it, I can share a quick idea of how your website could be improved.

Let me know 👍

Best,
Nithin
"""
    return subject, body


# ============================================================
# EMAIL TEMPLATE B — For leads WHO DON'T have a website
# They have no online presence — offer to build one
# ============================================================
def template_without_website(name, business_type, location):
    subject = "Your business deserves a website"
    body = f"""Hi,

I came across your business and noticed you don't currently have a website.

Today, most customers check online before choosing a service, and not having a website can mean missed opportunities.

I help businesses create modern, sleek websites with clean design and even 3D elements that make them stand out and look more premium.

The goal is simple — make your business look more trustworthy and attract more enquiries.

If you're interested, I can show a quick demo of how your business website could look.

Let me know 👍

Best,
Nithin
"""
    return subject, body


# ============================================================
# CSV HELPERS
# ============================================================
def load_leads(csv_file):
    if not os.path.exists(csv_file):
        print(f"[!] CSV file not found: {csv_file}")
        print(f"    Make sure {csv_file} is in the same folder as this script.")
        return []

    leads = []
    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        # Add 'sent' column if it doesn't exist yet
        for row in reader:
            if "sent" not in row:
                row["sent"] = ""
            leads.append(row)

    print(f"[+] Loaded {len(leads)} leads from {csv_file}")
    return leads

def save_leads(csv_file, leads, fieldnames):
    # Write to a temp file first then replace — avoids corruption if interrupted
    tmp_file = csv_file + ".tmp"
    with open(tmp_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(leads)
    shutil.move(tmp_file, csv_file)

def get_fieldnames(csv_file):
    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fields = list(reader.fieldnames or [])
    if "sent" not in fields:
        fields.append("sent")
    if "sent_at" not in fields:
        fields.append("sent_at")
    return fields


# ============================================================
# GMAIL SENDER
# ============================================================
def send_email(smtp, from_email, to_email, subject, body):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"{YOUR_NAME} <{from_email}>"
    msg["To"]      = to_email

    # Plain text version
    part = MIMEText(body, "plain")
    msg.attach(part)

    smtp.sendmail(from_email, to_email, msg.as_string())


def connect_gmail():
    print(f"\n[+] Connecting to Gmail as {YOUR_EMAIL}...")
    try:
        smtp = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        smtp.login(YOUR_EMAIL, YOUR_APP_PASSWORD)
        print("[+] Connected successfully!")
        return smtp
    except smtplib.SMTPAuthenticationError:
        print("\n[!] Gmail login failed.")
        print("    Make sure you're using an App Password, not your regular Gmail password.")
        print("    Get one at: myaccount.google.com/apppasswords")
        return None
    except Exception as e:
        print(f"\n[!] Connection error: {e}")
        return None


# ============================================================
# MAIN
# ============================================================
def main():
    print("=" * 60)
    print("  Email Sender Bot — Website Revamp Cold Emails")
    print("=" * 60)

    # Check config
    if YOUR_EMAIL == "youremail@gmail.com":
        print("\n[!] Please fill in YOUR_EMAIL, YOUR_APP_PASSWORD and YOUR_NAME")
        print("    at the top of this file before running.")
        return

    # Load leads
    leads = load_leads(CSV_FILE)
    if not leads:
        return

    fieldnames = get_fieldnames(CSV_FILE)

    # Count how many are unsent and have an email address
    unsent = [l for l in leads
              if l.get("email", "").strip()
              and l.get("sent", "").strip() != "yes"]

    print(f"[+] {len(unsent)} unsent leads with email addresses found")
    print(f"[+] {len(leads) - len(unsent)} already sent — will be skipped")

    if not unsent:
        print("\n[+] All leads have already been emailed. Nothing to send.")
        return

    print(f"\n[+] Starting to send emails...")
    print(f"    Delay between emails: {DELAY_MIN}–{DELAY_MAX} seconds")
    print(f"    Estimated time: {len(unsent) * DELAY_MIN // 60}–{len(unsent) * DELAY_MAX // 60} minutes\n")

    # Connect to Gmail
    smtp = connect_gmail()
    if not smtp:
        return

    sent_count  = 0
    error_count = 0

    for i, lead in enumerate(leads):
        email    = lead.get("email", "").strip()
        name     = lead.get("name", "").strip()
        btype    = lead.get("business_type", "business").strip()
        website  = lead.get("website", "").strip()
        location = lead.get("location", "your area").strip()
        already_sent = lead.get("sent", "").strip()

        # Skip if no email or already sent
        if not email or already_sent == "yes":
            continue

        # Pick the right template
        if website:
            subject, body = template_with_website(name, btype, website)
        else:
            subject, body = template_without_website(name, btype, location)

        # Send
        try:
            send_email(smtp, YOUR_EMAIL, email, subject, body)

            # Mark as sent in leads list
            lead["sent"]    = "yes"
            lead["sent_at"] = datetime.now().strftime("%Y-%m-%d %H:%M")

            sent_count += 1
            print(f"  [{sent_count}] Sent to {email} ({'has website' if website else 'no website'})")

            # Save progress after every email — safe if interrupted
            save_leads(CSV_FILE, leads, fieldnames)

            # Reconnect every 50 emails to keep connection alive
            if sent_count % 50 == 0:
                smtp.quit()
                time.sleep(5)
                smtp = connect_gmail()
                if not smtp:
                    print("[!] Could not reconnect. Stopping.")
                    break

            # Wait before next email
            delay = random.uniform(DELAY_MIN, DELAY_MAX)
            print(f"      Waiting {int(delay)}s before next email...")
            time.sleep(delay)

        except smtplib.SMTPRecipientsRefused:
            print(f"  [!] Invalid email address: {email} — skipping")
            lead["sent"] = "invalid"
            save_leads(CSV_FILE, leads, fieldnames)
            error_count += 1

        except smtplib.SMTPException as e:
            print(f"  [!] SMTP error for {email}: {e}")
            error_count += 1
            # Wait longer after an error
            time.sleep(30)

        except Exception as e:
            print(f"  [!] Unexpected error for {email}: {e}")
            error_count += 1

    # Close connection
    try:
        smtp.quit()
    except:
        pass

    print("\n" + "=" * 60)
    print(f"  DONE!")
    print(f"  Emails sent:  {sent_count}")
    print(f"  Errors:       {error_count}")
    print(f"  CSV updated:  {CSV_FILE}")
    print("=" * 60)
    print("\nTip: Run this script again anytime to send to new leads.")
    print("     Already-sent contacts will be automatically skipped.")


if __name__ == "__main__":
    main()
