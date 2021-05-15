import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.send('Результат печати');
    // res.render('print', { title: 'Печать' });
});

router.post('/', (req, res, next) => {
    // console.log(req);
    // console.log(req.params);
    const textForPrint = req.body.textForPrint;
    res.json({
        success: true,
        name: `Результат печати POST\n${textForPrint}`,
        time: "12:00"
    });
    // res.render('print', { title: 'Печать' });
});

export default router;