import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 1. Check the user's auth (or do in middleware)
    const user = 1; // || req.cookies['session'];

    if (req.method === "GET") {
        let events;

        if (req.body['startDate']) {
            const startDate = new Date(req.body['startDate']);
            const endDate = new Date((req.body['endDate'] || new Date()));

            try {
                events = await prisma.event.findMany({
                    where: {
                        date: {
                            lte: endDate,
                            gte: startDate
                        }
                    }
                });
            } catch {
                console.error("An error occurred while fetching Event rows.");
                res.status(500).json({ message: "An error occurred!" });
            }
        } else if (req.body['id']) {
            const id = req.body['id'];

            try {
                events = await prisma.event.findFirst({
                    where: {
                        id: { equals: id }
                    }
                });
            } catch {
                console.error("An error occurred while fetching the Event.");
                res.status(500).json({ message: "An error occurred!" });
            }
        }
        
        res.status(200).json({ events });
    } else if (req.method === "POST") {
        // 2. Build the event
        let newEvent = {
            title: req.body['title'],
            description: req.body['description'],
            date: new Date(req.body['date']),
            color: req.body['color'],
            
            authorId: user,
            calendarId: 1
        };

        // 3. Add it to the db.
        try {
            newEvent = await prisma.event.create({
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
        const id = req.body['id'];
        let event;

        try {
            event = await prisma.event.delete({
                where: {
                    id
                }
            });
        } catch {
            console.error("An error occured while deleting an Event.");
            res.status(500).json({ message: "An error occurred!" });
        }

        res.status(200).json({ deleted: event });
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