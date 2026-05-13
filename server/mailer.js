import {Resend} from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromAddress = process.env.RESEND_FROM_EMAIL || 'Deadmock <no-reply@deadmock.app>';

const renderEmail = ({title, body, ctaLabel, ctaUrl}) => `
  <div style="font-family:Arial,sans-serif;background:#0f151b;padding:24px;color:#f7ecd7">
    <div style="max-width:640px;margin:0 auto;background:#121b22;border:1px solid #2a3440;border-radius:20px;padding:32px">
      <p style="text-transform:uppercase;letter-spacing:.18em;color:#d8ab62;font-size:12px;margin:0 0 12px">Deadmock</p>
      <h1 style="margin:0 0 16px;font-size:28px;line-height:1.1">${title}</h1>
      <p style="margin:0 0 24px;line-height:1.6;color:#d8d0c2">${body}</p>
      ${ctaUrl ? `<a href="${ctaUrl}" style="display:inline-block;background:#d8ab62;color:#1a1208;padding:14px 20px;border-radius:999px;text-decoration:none;font-weight:700">${ctaLabel}</a>` : ''}
      <p style="margin:24px 0 0;font-size:12px;color:#a9b3bf">If you did not request this, you can ignore this email.</p>
    </div>
  </div>
`;

async function sendVerificationEmail({to, verifyUrl}) {
	return resend.emails.send({
		from: fromAddress,
		to,
		subject: 'Welcome to Deadmock - verify your email',
		html: renderEmail({
			title: 'Welcome to Deadmock',
			body: 'Verify your email address to activate your account and start using the site.',
			ctaLabel: 'Verify email',
			ctaUrl: verifyUrl,
		}),
		text: `Verify your Deadmock account: ${verifyUrl}`,
	});
}

async function sendPasswordResetEmail({to, resetUrl}) {
	return resend.emails.send({
		from: fromAddress,
		to,
		subject: 'Deadmock password reset',
		html: renderEmail({
			title: 'Reset your password',
			body: 'Use the link below to choose a new password. The link expires in one hour.',
			ctaLabel: 'Reset password',
			ctaUrl: resetUrl,
		}),
		text: `Reset your Deadmock password: ${resetUrl}`,
	});
}

export {sendPasswordResetEmail, sendVerificationEmail};