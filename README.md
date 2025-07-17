This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Media Storage (S3)

### Database

- New `Media` model for storing file metadata, supporting polymorphic association to any entity (Property, Unit, etc).

### Storage Service

- `lib/storage/storage.ts`: Composable S3 storage service for upload, delete, and signed URL generation.
- Uses AWS S3. Requires the following environment variables:
    - `AWS_ACCESS_KEY_ID`
    - `AWS_SECRET_ACCESS_KEY`
    - `AWS_REGION`
    - `AWS_S3_BUCKET`

### Media Actions

- `lib/actions/media.ts`: CRUD operations for media records and S3 objects.

### API Endpoints

- `POST /api/media` — Upload a file (multipart/form-data: file, entityType, entityId)
- `GET /api/media?entityType=Property&entityId=1` — List media for an entity
- `DELETE /api/media?id=MEDIA_ID` — Delete a media file

### Usage Example

- To upload a property image, POST to `/api/media` with the file and entityType=`Property`, entityId=`1`.
- To list images for a unit, GET `/api/media?entityType=Unit&entityId=2`.

### Extensibility

- The storage service and media actions are generic and can be reused for any entity type (Property, Unit, User, etc).
