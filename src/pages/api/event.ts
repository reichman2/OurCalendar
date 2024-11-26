import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

type ResponseData = {
    message?: string;
    err?: object;
    event?: object;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    // 1. Check the user's auth (or do in middleware)
    const user = 1; // || req.cookies['session'];
    
    if (req.method === "POST") {
        // 2. Build the event
        const newEvent = {
            title: req.body['title'],
            description: req.body['description'],
            date: new Date(req.body['date']),
            color: req.body['color'],
            
            authorId: user,
            calendarId: 1
        };

        // 3. Add it to the db.
        try {
            await prisma.event.create({
                data: newEvent
            })
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                console.error(`Error Code: ${err.code}`);
            } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
                console.error("Unknown Error");
            } else if (err instanceof Prisma.PrismaClientRustPanicError) {
                console.error("Rust Panic error");
            } else if (err instanceof Prisma.PrismaClientInitializationError) {
                console.error("client init error");
            } else if (err instanceof Prisma.PrismaClientValidationError) {
                console.error("VALIDATION ERROR");
            }

            console.error("An error occurred while creating a new Event.");

            res.status(500).json({ event: newEvent, message: "An error occurred!"});
            return;
        };

        res.status(200).json({ event: newEvent, message: "Success!" })
    } else if (req.method === "PATCH") {
        // TODO to MODIFY an existing event in the db.
        res.status(501).json({ message: "501 Not Implemented" });
    } else if (req.method === "DELETE") {
        // TODO to DELETE an existing event in the db.
        res.status(501).json({ message: "501 Not Implemented" });
    } else {
        res.status(405).json({ message: "405 Method not Allowed" });
    }


}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "1mb"
        }
    },

    maxDuration: 5
}