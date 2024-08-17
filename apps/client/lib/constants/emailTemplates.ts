import dayjs from "dayjs";

export const magicEmailTemplate = ({ token }: { token: string }): string =>
  /*html*/ `
  <!DOCTYPE html>
  <html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>Hey there!</h2>
  
    <p>Magic link to sign in to Leo Club Hours:</p>
  
    <p><a href="${process.env.NUXT_BASE_URL}/verify-email?token=${token}">
      ${process.env.NUXT_BASE_URL}/verify-email?token=${token}
    </a></p>
  
    <p>Link expires in 15 minutes.</p>
  
    <p><strong>DO NOT SHARE THIS LINK WITH ANYONE.</strong></p>
  
    <p>Need help? Reply to this email.</p>
  
    <p>- Leo Club Hours Team</p>
  </body>
  </html>
  `.trim();

export const acceptedEmailTemplate = ({
  email,
  organization,
}: {
  email: string;
  organization: typeof organizationsTable.$inferSelect;
}): string =>
  /*html*/ `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Hey ${email}!</h2>
    
      <p>You have been accepted to ${organization.name}</p>

      <p>
      <a href="${process.env.NUXT_BASE_URL}/orgs/${organization.slug}">
      ${process.env.NUXT_BASE_URL}/orgs/${organization.slug}
      </a>
      </p>


      
    </body>
    </html>
    `.trim();

export const rejectedEmailTemplate = ({
  email,
  organization,
}: {
  email: string;
  organization: typeof organizationsTable.$inferSelect;
}): string =>
  /*html*/ `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Hey ${email}!</h2>
    
      <p>You have been rejected from ${organization.name}</p>

      <p>Please contact the organization owner for more information or submit another request to join.</p>

      <p>
      <a href="${process.env.NUXT_BASE_URL}/orgs/${organization.slug}/join">
      ${process.env.NUXT_BASE_URL}/orgs/${organization.slug}/join
      </a>
      </p>
      
    </body>
    </html>
    `.trim();

export const deactivatedEmailTemplate = ({
  email,
  organization,
}: {
  email: string;
  organization: typeof organizationsTable.$inferSelect;
}): string =>
  /*html*/ `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Hey ${email}!</h2>
    
      <p>You have been deactivated from ${organization.name}</p>

      <p>
      <a href="${process.env.NUXT_BASE_URL}/orgs/${organization.slug}">
      ${process.env.NUXT_BASE_URL}/orgs/${organization.slug}
      </a>
      </p>
      
    </body>
    </html>
    `.trim();

export const reactivatedEmailTemplate = ({
  email,
  organization,
}: {
  email: string;
  organization: typeof organizationsTable.$inferSelect;
}): string =>
  /*html*/ `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Hey ${email}!</h2>
    
      <p>You have been reactivated in ${organization.name}</p>

      <p>
      <a href="${process.env.NUXT_BASE_URL}/orgs/${organization.slug}">
      ${process.env.NUXT_BASE_URL}/orgs/${organization.slug}
      </a>
      </p>
      
    </body>
    </html>
    `.trim();

export const joinRequestEmailTemplate = ({
  email,
  organization,
}: {
  email: string;
  organization: typeof organizationsTable.$inferSelect;
}): string =>
  /*html*/ `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Hey ${organization.name}!</h2>
    
      <p>${email} has requested to join ${organization.name}</p>

      <p>
      <a href="${process.env.NUXT_BASE_URL}/orgs/${organization.slug}/members?status=pending">
      ${process.env.NUXT_BASE_URL}/orgs/${organization.slug}/members?status=pending
      </a>
      </p>
      
    </body>
    </html>
    `.trim();

export const removedEmailTemplate = ({
  email,
  organization,
}: {
  email: string;
  organization: typeof organizationsTable.$inferSelect;
}): string =>
  /*html*/ `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Hey ${email}!</h2>
        
          <p>You have been removed from ${organization.name}</p>
    
          <p>
          <a href="${process.env.NUXT_BASE_URL}/orgs/${organization.slug}">
          ${process.env.NUXT_BASE_URL}/orgs/${organization.slug}
          </a>
          </p>
          
        </body>
        </html>
        `.trim();

export const activityReminderEmailTemplate = ({
  email,
  organization,
  activity,
}: {
  email: string;
  organization: typeof organizationsTable.$inferSelect;
  activity: typeof activitiesTable.$inferSelect;
}): string =>
  /*html*/ `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>
    Hey ${email}!
    </h2>

    <p>
      Don't forget about the upcoming ${activity.name} activity with ${organization.name}!
    </p>

    <p style="font-size: 0.8em;">
      Here are the details:
    </p>

    <p>
      <strong>Activity:</strong> ${activity.name}
    </p>

    <p>
      <strong>Organization:</strong> ${organization.name}
    </p>

    <p>
      <strong>Hours:</strong> ${activity.hours} ${activity.hours === 1 ? "hr" : "hrs"}
    </p>

    <p>
      <strong>Date:</strong> ${dayjs(
        new Date(activity.scheduledStartDatetime)
      ).format("MMMM DD, YYYY")}
    </p>

    <p>
      <strong>Time:</strong> ${
        activity.scheduledEndDatetime
          ? `${dayjs(new Date(activity.scheduledStartDatetime)).format("h:mm A")} - ${dayjs(new Date(activity.scheduledEndDatetime)).format("h:mm A")}`
          : dayjs(new Date(activity.scheduledStartDatetime), {
              utc: true,
            }).format("hh:mm A")
      }

    ${activity.location ? `<p><strong>Location:</strong> <a href="maps://maps.apple.com/?daddr=${encodeURIComponent(activity.location)}">${activity.location}</a></p>` : ""}

   
    
    </body>
    </html>
    `.trim();

export const activityUpdateReminderEmailTemplate = ({
  email,
  organization,
  newActivity,
  oldActivity,
}: {
  email: string;
  organization: typeof organizationsTable.$inferSelect;
  newActivity: typeof activitiesTable.$inferSelect;
  oldActivity: typeof activitiesTable.$inferSelect;
}): string =>
  /*html*/ `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>
    Hey ${email}!
    </h2>

    <p>
      Don't forget about the upcoming ${newActivity.name} activity with ${organization.name}!
    </p>

    <p style="font-size: 0.8em;">
      Here are the details:
    </p>

    <p>
      <strong>Activity:</strong> Old(${oldActivity.name}) --> New(${newActivity.name})
    </p>

    <p>
      <strong>Organization:</strong> ${organization.name}
    </p>

    <p>
      <strong>Hours:</strong> Old(${oldActivity.hours} ${oldActivity.hours === 1 ? "hr" : "hrs"}) --> New(${oldActivity.hours} ${oldActivity.hours === 1 ? "hr" : "hrs"})
      </p>
    </p>

    <p>
      <strong>Date:</strong> Old(${dayjs(
        new Date(oldActivity.scheduledStartDatetime)
      ).format("MMMM DD, YYYY")}) --> New(${dayjs(
        new Date(newActivity.scheduledStartDatetime)
      ).format("MMMM DD, YYYY")})
    </p>

    <p>
      <strong>Time:</strong> Old(${
        oldActivity.scheduledEndDatetime
          ? `${dayjs(new Date(oldActivity.scheduledStartDatetime)).format("h:mm A")} - ${dayjs(new Date(oldActivity.scheduledEndDatetime)).format("h:mm A")}`
          : dayjs(new Date(oldActivity.scheduledStartDatetime), {
              utc: true,
            }).format("hh:mm A")
      }) --> New(${
        newActivity.scheduledEndDatetime
          ? `${dayjs(new Date(newActivity.scheduledStartDatetime)).format("h:mm A")} - ${dayjs(new Date(newActivity.scheduledEndDatetime)).format("h:mm A")}`
          : dayjs(new Date(newActivity.scheduledStartDatetime), {
              utc: true,
            }).format("hh:mm A")
      })

   ${oldActivity.location ? ` Old(<p><strong>Location:</strong> <a href="maps://maps.apple.com/?daddr=${encodeURIComponent(oldActivity.location)}">${oldActivity.location}</a></p>)` : ""} --> ${oldActivity.location ? `New(<p><strong>Location:</strong> <a href="maps://maps.apple.com/?daddr=${encodeURIComponent(oldActivity.location)}">${oldActivity.location}</a></p>)` : ""})


   
    
    </body>
    </html>
    `.trim();
