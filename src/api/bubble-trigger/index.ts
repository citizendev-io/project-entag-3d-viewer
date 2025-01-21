// import axios from 'axios';
import axios from 'axios';
import { Request, Response } from 'express';

export const POST = async (req: Request, res: Response) => {
  const { body } = req;

  const { part_id, version, image, urn } = body;

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

// export default async function handler(req: Request, res: Response) {
//   if (req.method === "GET") {
//     return GET(req, res);
//   } else if (req.method === "POST") {
//     return POST(req, res);
//   } else {
//     res.status(405).json({ error: "Method Not Allowed" });
//   }
// }