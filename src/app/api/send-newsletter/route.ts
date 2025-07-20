import { NextResponse } from "next/server";
import mailchimp, {
  AnySegmentCondition,
  type campaigns,
} from "@mailchimp/mailchimp_marketing";

import { getSortedPostsData, PostData } from "../../utils/postsUtils";
import { formatDateString } from "@/app/utils/formatDateString";

// Read config from environment variables with fallbacks
const MAILCHIMP_API_KEY: string | undefined = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_API_SERVER: string | undefined =
  process.env.MAILCHIMP_API_SERVER;
const MAILCHIMP_AUDIENCE_ID: string | undefined =
  process.env.MAILCHIMP_AUDIENCE_ID;
const BLOG_BASE_URL: string | undefined =
  process.env.BLOG_BASE_URL || "http://localhost:3000";

// Fail early if any required config is missing
if (!MAILCHIMP_API_KEY || !MAILCHIMP_API_SERVER || !MAILCHIMP_AUDIENCE_ID) {
  throw new Error(
    "Mailchimp configuration missing in environment variables. Please set MAILCHIMP_API_KEY, MAILCHIMP_API_SERVER, and MAILCHIMP_AUDIENCE_ID."
  );
}

// Configure Mailchimp SDK
mailchimp.setConfig({
  apiKey: MAILCHIMP_API_KEY,
  server: MAILCHIMP_API_SERVER,
});

// -- BEGIN TYPE DEFINITIONS --
interface CampaignCreateRecipients {
  list_id: string;
  segment_opts?: {
    saved_segment_id?: number;
    match?: "any" | "all";
    conditions?: AnySegmentCondition[];
  };
}

interface CampaignCreateSettings {
  subject_line: string;
  preview_text: string;
  title: string;
  from_name: string;
  reply_to: string;
  to_name: string;
  use_conversation?: boolean;
  folder_id?: string;
  authenticate?: boolean;
  auto_footer?: boolean;
  inline_css?: boolean;
  fb_comments?: boolean;
  template_id?: number;
  timewarp?: boolean;
  drag_and_drop?: boolean;
  auto_tweet?: boolean;
}

interface CampaignCreatePayload {
  type: "regular" | "plaintext" | "absplit" | "rss" | "variate";
  recipients: CampaignCreateRecipients;
  settings: CampaignCreateSettings;
}

interface MailchimpErrorResponseBody {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Array<{
    field?: string;
    message?: string;
  }>;
}

interface MailchimpAPIError extends Error {
  status?: number;
  response?: {
    body?: MailchimpErrorResponseBody;
  };
}
// --- END TYPE DEFINITIONS ---

// Type guard for Mailchimp API errors
function isMailchimpAPIError(error: unknown): error is MailchimpAPIError {
  return (
    error instanceof Error &&
    typeof (error as MailchimpAPIError).status === "number" &&
    (error as MailchimpAPIError).response?.body !== undefined
  );
}

// API Route Handler: Sends the latest blog post as a Mailchimp newsletter campaign
export async function GET() {
  try {
    const allPosts: PostData[] = getSortedPostsData();

    if (allPosts.length === 0) {
      console.log("No blog posts found to send this week.");
      return NextResponse.json(
        { message: "No blog posts found to send." },
        { status: 200 }
      );
    }

    // Get the latest post and 3 other recent posts
    const latestPost = allPosts[0];
    const numberOfOtherRecentPosts = 3;
    const otherPostsForNewsletter = allPosts
      .slice(1)
      .slice(0, numberOfOtherRecentPosts);

    const campaignName = `Blog Newsletter - ${formatDateString(
      new Date().toISOString().split("T")[0]
    )}`; // Use current date for naming
    const campaignSubject = `Your Weekly Update: ${latestPost.title} & More!`;

    // 1. Greeting Message
    const greetingMessageContent = `
      <p style="margin-top: 5px; font-weight: bold; text-align: center; margin-bottom: 25px; font-family: Arial, sans-serif; font-size: 18px; line-height: 28px; color: #333333;">
        Hello Subscriber!
      </p>
      <p style="margin-top: 0; margin-bottom: 25px; text-align: center; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; color: #555555;">
        Ready for your weekly dive into the world of programming? I've just published some fresh insights and practical tips that i think you'll find useful.
      </p>
    `;

    // 2. Featured Post
    const featuredPostContent = `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%; border-spacing:0; mso-table-lspace:0pt; mso-table-rspace:0pt; margin-bottom: 30px; border-radius: 8px; border: 1px solid;">
    <tr>
        <td style="padding: 30px;">
            <h3 style="margin-top: 0; margin-bottom: 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 22px; line-height: 28px;">
                <a href="${BLOG_BASE_URL}/blog/${
      latestPost.slug
    }" style="color: #1a1a1a; text-decoration: none; font-weight: bold;">${
      latestPost.title
    }</a>
            </h3>
            <p style="margin-bottom: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #4a5568;">${
              latestPost.description
            }</p>
            <p style="margin-bottom: 12px; font-family: Arial, sans-serif; font-size: 14px; color: #718096;"><strong>Published:</strong> ${formatDateString(
              latestPost.date
            )}</p>
            ${
              latestPost.tags && latestPost.tags.length > 0
                ? `<p style="margin-top: 0; font-family: Arial, sans-serif; font-size: 14px; color: #718096;"><strong>Tags:</strong> ${latestPost.tags
                    .map(
                      (tag) =>
                        `<span style="display: inline-block; background-color: #FFD230; color: #1a1a1a; padding: 2px 8px; border-radius: 4px; margin-right: 5px; margin-bottom: 5px;">${tag}</span>`
                    )
                    .join("")}</p>`
                : ""
            }
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top: 25px;">
                <tr>
                    <td align="center" style="border-radius: 4px;">
                        <a href="${BLOG_BASE_URL}/blog/${
      latestPost.slug
    }" target="_blank" style="font-size: 16px; color: #007BFF; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-decoration: none; display: inline-block; font-weight: bold;">
                            Read More
                        </a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
    `;

    // 3. Other Posts
    let otherPostsContent = ``;
    if (otherPostsForNewsletter.length > 0) {
      otherPostsContent += `
        <h2 style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 24px; line-height: 32px; color: #1a202c; margin-top: 25px; margin-bottom: 25px; padding-top: 25px;">Other Recent Posts</h2>
        `;
      otherPostsForNewsletter.forEach((post) => {
        otherPostsContent += `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%; border-spacing:0; mso-table-lspace:0pt; mso-table-rspace:0pt; margin-bottom: 25px; background-color: #ffffff; border-radius: 6px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
    <tr>
        <td style="padding: 25px;">
            <h3 style="margin-top: 0; margin-bottom: 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 19px; line-height: 26px;">
                <a href="${BLOG_BASE_URL}/blog/${
          post.slug
        }" style="color: #2c3e50; text-decoration: none; font-weight: bold;">${
          post.title
        }</a>
            </h3>
            <p style="margin-bottom: 12px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 22px; color: #555555;">${
              post.description
            }</p>
            <p style="margin-top: 0; font-family: Arial, sans-serif; font-size: 13px; color: #777777;"><strong>Published:</strong> ${formatDateString(
              post.date
            )}</p>
            ${
              post.tags && post.tags.length > 0
                ? `<p style="margin-top: 8px; font-family: Arial, sans-serif; font-size: 13px; color: #777777;"><strong>Tags:</strong> ${post.tags
                    .map(
                      (tag) =>
                        `<span style="display: inline-block; background-color: #FFD230; color: #1A1A1A; padding: 1px 7px; border-radius: 3px; margin-right: 4px; margin-bottom: 4px;">${tag}</span>`
                    )
                    .join("")}</p>`
                : ""
            }
            <p style="margin-top: 20px; font-family: Arial, sans-serif; font-size: 14px;">
                <a href="${BLOG_BASE_URL}/blog/${
          post.slug
        }" style="text-decoration: none; font-weight: bold;">Read More</a>
            </p>
        </td>
    </tr>
</table>
            `;
      });
    } else {
      otherPostsContent = `<p style="font-family: Arial, sans-serif; font-size: 16px; color: #555555;">No other recent posts to highlight this week.</p>`;
    }

    // 4. Closing Message
    const closingMessageContent = `
<p style="margin-top: 25px; text-align: center; margin-bottom: 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #333333;">
  I hope these insights and coding tips help power up your next project. Keep building, keep learning, and i'll catch you in the next dispatch!
</p>
<p style="margin-bottom: 0; text-align: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #333333; font-weight: bold;">
  Happy coding,
</p>
<p style="margin-top: 5px; text-align: center; margin-bottom: 25px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; color: #333333;">
  The Programmer's Gazette
</p>
    `;
    const fullEmailHtml = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>The Programmer's Gazette Newsletter</title>
    <style type="text/css">
        /* Global styles */
        body { margin: 0; padding: 0; background-color: #f0f0f0; font-family: Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
        img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; max-width: 100%; height: auto; display: block; }
        a { text-decoration: none; color: #007bff; }
        h1, h2, h3, h4, h5, h6 { margin: 0; padding: 0; }

        /* Specific section styles to match image_eca841.jpg */
        .header-bg { background-color: #1a1a1a; padding: 30px 0; }
        .header-title { font-size: 48px; color: #ffffff; font-weight: bold; text-align: center; line-height: 1.2; margin: 0; }
        .social-button-container { text-align: center; padding: 20px 0; }
        .social-button { display: inline-block; background-color: #333333; color: #ffffff; padding: 10px 18px; margin: 0 8px; border-radius: 5px; text-decoration: none; font-size: 15px; border: 1px solid #444; }
        .content-wrapper { background-color: #ffffff; padding: 40px 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }

        /* Mobile Responsive */
        @media screen and (max-width: 600px) {
            .full-width-table {
                width: 100% !important;
            }
            .content-wrapper {
                padding: 20px !important;
            }
            .header-title {
                font-size: 38px !important;
            }
            .social-button {
                padding: 8px 12px !important;
                margin: 0 5px !important;
                font-size: 13px !important;
            }
        }
    </style>
</head>
<body>
    <center style="width: 100%; background-color: #f0f0f0;">
        <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
            Your weekly dose of coding insights! Read my latest posts.
        </div>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0; mso-table-lspace:0pt; mso-table-rspace:0pt;">
            <tr>
                <td align="center" style="padding: 0;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="full-width-table" style="width:600px; max-width:600px;">
                        <tr>
                            <td class="header-bg">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td style="padding: 20px 30px;">
                                            <h1 class="header-title">The Programmer's Gazette</h1>
                                            </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 30px 0;">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="content-wrapper">
                                    <tr>
                                        <td style="padding: 0 10px;">
                                            ${greetingMessageContent}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 10px;">
                                            ${featuredPostContent}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 10px;">
                                            ${otherPostsContent}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 10px;">
                                            ${closingMessageContent}
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
    `;

    // Prepare the Mailchimp campaign payload
    const campaignPayload: CampaignCreatePayload = {
      type: "regular",
      recipients: {
        list_id: MAILCHIMP_AUDIENCE_ID!,
      },
      settings: {
        subject_line: campaignSubject,
        preview_text: latestPost.description,
        title: campaignName,
        from_name: "The Programmer's Gazette",
        reply_to: "theprogrammersgazette@gmail.com",
        to_name: "*|FNAME|*",
        inline_css: true,
      },
    };

    // Create the campaign in Mailchimp
    const campaignCreationResponse = await mailchimp.campaigns.create(
      campaignPayload
    );
    const campaignData: campaigns.Campaigns =
      campaignCreationResponse as campaigns.Campaigns;
    const campaignId: string = campaignData.id;

    // Sending full HTML
    await mailchimp.campaigns.setContent(campaignId, {
      html: fullEmailHtml,
    });

    await mailchimp.campaigns.send(campaignId);

    console.log(
      `Newsletter campaign '${campaignName}' sent successfully! Campaign ID: ${campaignId}`
    );
    return NextResponse.json({
      message: "Newsletter sent successfully!",
      campaignId: campaignId,
    });
  } catch (error: unknown) {
    // Log errors
    console.error("Error sending newsletter:");
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    if (isMailchimpAPIError(error)) {
      console.error("Mailchimp API Error Status:", error.status);
      console.error("Mailchimp API Error Response Body:", error.response?.body);
    } else {
      console.error("An unexpected error occurred:", error);
    }
    // Return error response
    return NextResponse.json(
      { message: "Failed to send newsletter. Check server logs for details." },
      { status: 500 }
    );
  }
}
