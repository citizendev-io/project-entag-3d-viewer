// import axios from 'axios';
import axios from 'axios';
import type { VercelRequest, VercelResponse } from '@vercel/node'

// export const config = {
//   runtime: 'nodejs', // this is a pre-requisite
// };

export function GET() {
  return new Response(`Hello from ${process.env.VERCEL_REGION}`);
}

export async function POST(req: VercelRequest, res: VercelResponse) {
  const { body } = req;

  const { part_id, version, image, urn } = body;

  console.log(await req.body)

  const imageSubmit = await axios.post(
    `https://entag-10502.bubbleapps.io/version-${version}/api/1.1/wf/create_3d_preview`,
    {
      part_id,
      image: image,
      private: false,
      version,
      urn
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer bae073c7b9b6abf8d88992dd8fffc7c3`
      }
    }
  )

  res.status(200).json(
    {
      message: 'Image submitted successfully',
      data: imageSubmit.data
    }
  );
}