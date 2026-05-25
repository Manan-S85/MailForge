import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

export const DEFAULT_CATEGORIES = [
  { name: "Onboarding" },
  { name: "Authentication" },
  { name: "Billing" },
  { name: "Marketing" },
];

const DEFAULT_PLACEHOLDERS = [
  { key: "first_name", description: "User's first name", sample_value: "Alex" },
  { key: "last_name", description: "User's last name", sample_value: "Johnson" },
  { key: "company_name", description: "Company or product name", sample_value: "AcmeCorp" },
  { key: "plan_name", description: "Subscription plan name", sample_value: "Pro" },
  { key: "plan_price", description: "Plan price", sample_value: "$29/month" },
  { key: "expiry_date", description: "Expiration or due date", sample_value: "Jun 15, 2026" },
  { key: "support_email", description: "Support contact email", sample_value: "support@acmecorp.com" },
  { key: "product_name", description: "Product/service name", sample_value: "AcmeCorp Analytics" },
  { key: "discount_percent", description: "Discount percentage", sample_value: "30%" },
  { key: "coupon_code", description: "Coupon or promo code", sample_value: "WELCOME30" },
  { key: "reset_link", description: "Password reset URL", sample_value: "https://app.acmecorp.com/reset?token=abc123" },
  { key: "current_year", description: "Current year", sample_value: "2026" },
];

export const SAMPLE_TEMPLATES = [
  {
    name: "Welcome Email",
    subject: "Welcome to {{company_name}} 🚀",
    body_html: `<h1>Welcome aboard, {{first_name}}!</h1>
<p>Thanks for joining <strong>{{company_name}}</strong>. We're excited to have you on the team.</p>
<p>Here's what you can do to get started:</p>
<ul>
  <li>Complete your profile</li>
  <li>Explore the dashboard</li>
  <li>Invite your teammates</li>
</ul>
<p>If you have any questions, just reply to this email — we're here to help.</p>
<p>Best,<br>The {{company_name}} Team</p>`,
    category_name: "Onboarding",
    placeholders: ["first_name", "company_name"],
  },
  {
    name: "Password Reset",
    subject: "Reset your {{company_name}} password",
    body_html: `<h1>Password reset request</h1>
<p>Hi {{first_name}},</p>
<p>We received a request to reset the password for your {{company_name}} account. Use the link below to set a new one:</p>
<p><a href="{{reset_link}}">Reset your password</a></p>
<p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
<p>Thanks,<br>The {{company_name}} Team</p>`,
    category_name: "Authentication",
    placeholders: ["first_name", "company_name", "reset_link"],
  },
  {
    name: "Account Verification",
    subject: "Verify your {{company_name}} email address",
    body_html: `<h1>Verify your email</h1>
<p>Hi {{first_name}},</p>
<p>Thanks for creating an account with {{company_name}}. Please verify your email address by visiting the link below:</p>
<p><a href="{{reset_link}}">Verify your email address</a></p>
<p>If you didn't create this account, please ignore this email.</p>
<p>Best,<br>The {{company_name}} Team</p>`,
    category_name: "Authentication",
    placeholders: ["first_name", "company_name", "reset_link"],
  },
  {
    name: "Billing Reminder",
    subject: "Your {{plan_name}} plan renews soon",
    body_html: `<h1>Upcoming billing</h1>
<p>Hi {{first_name}},</p>
<p>This is a reminder that your <strong>{{plan_name}}</strong> plan ({{plan_price}}) will auto-renew on <strong>{{expiry_date}}</strong>.</p>
<p>No action needed if you'd like to continue. You can manage your subscription from your billing settings anytime.</p>
<p>Thanks for being a valued customer!</p>
<p>Best,<br>The {{company_name}} Team</p>`,
    category_name: "Billing",
    placeholders: ["first_name", "plan_name", "plan_price", "expiry_date", "company_name"],
  },
  {
    name: "Subscription Expiring",
    subject: "Your {{company_name}} subscription is ending",
    body_html: `<h1>We'll miss you, {{first_name}}</h1>
<p>Your <strong>{{plan_name}}</strong> subscription at {{company_name}} is expiring on <strong>{{expiry_date}}</strong>.</p>
<p>Don't want to lose access? Here's a special offer just for you:</p>
<div style="text-align:center;margin:24px 0">
  <div style="font-size:28px;font-weight:700;color:#6366f1">{{discount_percent}} OFF</div>
  <p style="margin-top:4px">Use code <strong>{{coupon_code}}</strong> at checkout to renew and save.</p>
</div>
<p>If you have any feedback, we'd love to hear it. Just reply to this email.</p>
<p>Best,<br>The {{company_name}} Team</p>`,
    category_name: "Billing",
    placeholders: ["first_name", "plan_name", "company_name", "expiry_date", "discount_percent", "coupon_code"],
  },
  {
    name: "Discount Offer",
    subject: "🎉 Special {{discount_percent}} off — just for you, {{first_name}}!",
    body_html: `<h1>Happy holidays from {{company_name}}!</h1>
<p>Hi {{first_name}},</p>
<p>To celebrate the season, we're offering <strong>{{discount_percent}} off</strong> your next month on the <strong>{{plan_name}}</strong> plan.</p>
<div style="text-align:center;margin:24px 0">
  <div style="font-size:20px;font-weight:700;color:#6366f1">Use code: {{coupon_code}}</div>
</div>
<p>This offer expires on {{expiry_date}}. Don't miss out!</p>
<p>Warmly,<br>The {{company_name}} Team</p>`,
    category_name: "Marketing",
    placeholders: ["first_name", "company_name", "discount_percent", "plan_name", "coupon_code", "expiry_date"],
  },
  {
    name: "Re-engagement Email",
    subject: "{{first_name}}, we miss you at {{company_name}}",
    body_html: `<h1>It's been a while, {{first_name}}</h1>
<p>We noticed you haven't visited {{company_name}} recently. We'd love to have you back!</p>
<p>Here's what's new since your last visit:</p>
<ul>
  <li>Improved dashboard with real-time analytics</li>
  <li>New integrations with your favorite tools</li>
  <li>Faster performance and better reliability</li>
</ul>
<p>Ready to jump back in? <a href="{{reset_link}}">Go to your dashboard</a></p>
<p>See you soon!</p>
<p>Best,<br>The {{company_name}} Team</p>`,
    category_name: "Marketing",
    placeholders: ["first_name", "company_name", "reset_link"],
  },
];

export async function seedUserData(supabase: SupabaseClient, user: User) {
  const catMap = new Map<string, string>();

  for (const cat of DEFAULT_CATEGORIES) {
    const { data, error } = await supabase
      .from("categories")
      .insert({ owner_id: user.id, name: cat.name })
      .select("id,name")
      .single();

    if (error) {
      console.error("Seed: failed to insert category", cat.name, error);
      continue;
    }
    if (data) {
      catMap.set(data.name, data.id);
    }
  }

  for (const ph of DEFAULT_PLACEHOLDERS) {
    const { error } = await supabase
      .from("placeholders")
      .insert({ owner_id: user.id, ...ph });

    if (error) {
      console.error("Seed: failed to insert placeholder", ph.key, error);
    }
  }

  for (const tpl of SAMPLE_TEMPLATES) {
    const { error } = await supabase
      .from("templates")
      .insert({
        owner_id: user.id,
        name: tpl.name,
        subject: tpl.subject,
        body_html: tpl.body_html,
        body_json: null,
        category_id: catMap.get(tpl.category_name) ?? null,
        status: "active",
        placeholders: tpl.placeholders,
      });

    if (error) {
      console.error("Seed: failed to insert template", tpl.name, error);
    }
  }
}
