import express from 'express';
import fs, { fdatasync, PathLike } from "fs";

const router = express.Router();


type prodModel = {
    id: number,
    groupId: number,
    name: string,
    image?: string
}

// type prodViewModel = {

//     id: number,
//     groupId: number,
//     groupName: string,
//     name: string
// }

type groupModel = {
    id: number,
    name: string
}

type groupViewModel = {
    groupId: number,
    groupName: string,
    prods: prodModel[]
}

type prodsDumpModel = {
    groups: groupModel[],
    prods: prodModel[]
}


router.get('/', (req, res, next) => {

    const jsonStr = fs.readFileSync(`${__dirname}/prods.json`, "utf-8");
    const prodsDump: prodsDumpModel = JSON.parse(jsonStr);
    const groups = prodsDump.groups;
    const prods = prodsDump.prods;


    function getGroupById(groupId: number) {
        return groups.find(g => g.id === groupId);
    }


    const groupsView: groupViewModel[] = [];
    prods.forEach(prod => {
        const group = getGroupById(prod.groupId);
        let existGrView = groupsView.find(g => g.groupId === prod.groupId);
        if (existGrView == null) {
            existGrView = {
                groupId: prod.groupId,
                groupName: group.name,
                prods: []
            }
            groupsView.push(existGrView);
        }
        existGrView.prods.push(prod);
    });





    res.render('shopptinglist', { title: 'Список покупок', groupsView });
});

export default router;