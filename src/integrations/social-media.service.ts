import { Injectable } from '@nestjs/common';

@Injectable()
export class SocialMediaService {
  // LinkedIn
  async postToLinkedIn(accessToken: string, text: string, visibility = 'PUBLIC') {
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        author: 'urn:li:person:AUTHOR_ID',
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': visibility }
      })
    });

    return response.json();
  }

  async getLinkedInProfile(accessToken: string) {
    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    return response.json();
  }

  // Twitter/X
  async postToTwitter(accessToken: string, text: string) {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    return response.json();
  }

  // Facebook
  async postToFacebook(accessToken: string, pageId: string, message: string) {
    const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        access_token: accessToken
      })
    });

    return response.json();
  }

  async getFacebookPageInsights(accessToken: string, pageId: string) {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/insights?metric=page_impressions,page_engaged_users&access_token=${accessToken}`
    );

    return response.json();
  }
}
