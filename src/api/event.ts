import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../lib/prisma';

type ResponseData = {
    message?: string;
    err?: object;
    event?: object;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    // 1. Check the user's auth (or do in middleware)
    const user = 1; // || req.cookies['session'];
    
    if (req.method === "POST") {
        // 2. Build the event
        const newEvent = {
            title: req.body['title'],
            description: req.body['description'],
            date: req.body['date'],
            color: req.body['color'],
            
            authorId: user,
            calendarId: req.body['calendar']
        };

        // 3. Add it to the db.
        prisma.event.create({
            data: newEvent
        }).catch(err => {
            console.error("An error occurred while creating a new Event.");
            console.error(err);

            res.status(500).json({ event: newEvent, err});
        });
    } else if (req.method === "PATCH") {
        // TODO to MODIFY an existing event in the db.
        res.status(501).json({ message: "501 Not Implemented" });
    } else if (req.method === "DELETE") {
        // TODO to DELETE an existing event in the db.
        res.status(501).json({ message: "501 Not Implemented" });
    } else {
        res.status(405).json({ message: "405 Method not Allowed" });
    }

    res.status(200).json({ message: "Hello, World!" });
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "1mb"
        }
    },

    maxDuration: 5
}