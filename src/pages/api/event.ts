import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';


type EventType = {
    id: string;
    date: Date | string;
    title: string;
    description?: string;
    color?: string;

    authorId?: number;
    calendarId?: number;
};

type EventModifyType = {
    id?: string;
    date?: Date | string;
    title?: string;
    description?: string;
    color?: string;

    authorId?: number;
    calendarId?: number;
};


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
        const id = req.body['id'];
        let validated;

        try {
            validated = validateEventValues({
                date: req.body['date'],
                title: req.body['title'],
                description: req.body['description'],
                color: req.body['color']
            });
        } catch (err) {
            let errMsg;
            if (err instanceof Error) {
                errMsg = err.message;
            }
                
            res.status(400).json({ message: errMsg ?? "An error relating to the validity of your request has occurrd.  Please try again." });
            return;
        }

        let event;       
        try {
            event = await prisma.event.update({
                where: { id },
                data: validated
            });
        } catch (err) {
            console.log("An error occurred while updating an event.");

            if (err instanceof Error) {
                console.log(err.stack);
            }

            res.status(500).json({ message: "An error occurred!" });
        }
        
        res.status(200).json({ event });
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


function validateEventValues(obj: EventModifyType) {
    const values: EventModifyType = {};

    if (obj.color && (typeof obj.color == "string") && obj.color.length == 6) {
        values.color = obj.color;
    }
    
    if (obj.date) {
        const newDate = new Date(obj.date);

        if (Number.isNaN(newDate.getTime())) {
            throw new Error("Invalid Date");
        }

        values.date = newDate;
    }

    if (obj.title) {
        if (obj.title.length >= 3 && obj.title.length <= 50) {
            values.title = obj.title;
        } else {
            throw new Error("Invalid Title Length");
        }
    }

    if (obj.description) {
        if (obj.description.length <= 750) {
            values.description = obj.description;
        } else {
            throw new Error("Invalid Description Length");
        }
    }

    return values;
}


export const config = {
    api: {
        bodyParser: {
            sizeLimit: "1mb"
        }
    },

    maxDuration: 5
}