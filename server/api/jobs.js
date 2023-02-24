const express = require("express");
const router = express.Router();
const { Position, Question, db, Answer } = require("../db");
const Candidate = require("../db/Candidate");

router.post("/create", async function (req, res) {
  const payload = req.body;

  try {
    const result = await db.transaction(async (t) => {
      const p = await Position.create(
        {
          title: payload.title,
          status: payload.status,
          invitations: payload.invitations,
        },
        { transaction: t }
      );

      const qs = await Promise.all(
        payload.questions.map(async (q) => {
          return await Question.create(
            { question: q.question, positionId: p.id },
            {
              transaction: t,
            }
          );
        })
      );

      return { position: p, questions: qs };
    });

    res.send(result);

    // If the execution reaches this line, the transaction has been committed successfully
    // `result` is whatever was returned from the transaction callback (the `user`, in this case)
  } catch (error) {
    res.status(400).send(error);
    console.log(error);

    // If the execution reaches this line, an error occurred.
    // The transaction has already been rolled back automatically by Sequelize!
  }
});

router.delete("/delete/:id", async function (req, res, next) {
  try {
    const position = await Position.findByPk(req.params.id, {
      include: Question,
    });

    await Promise.all(position.questions.map((q) => q.destroy()));
    await position.destroy();

    res.send(true);
  } catch (error) {
    console.log("delete REQ ERROR", error);
    next(error);
  }
});

router.get("/findAllActiveJobs", async (req, res, next) => {
  try {
    const result = await Position.findAll({
      where: { status: true },
      include: Question,
    });
    res.send(result);
  } catch (error) {
    console.log("get REQ ERROR", error);
    next(error);
  }
});

router.get("/findAllClosedJobs", async (req, res, next) => {
  try {
    const result = await Position.findAll({
      where: { status: false },
      include: Question,
    });
    res.send(result);
  } catch (error) {
    console.log("get REQ ERROR", error);
    next(error);
  }
});

router.put("/changeJobStatusToClosed/:id", async (req, res, next) => {
  const position = await Position.findByPk(req.params.id);
  if (!position) {
    return res.status(404).send("Position not found");
  }
  position.status = false;
  await position.save();
});

router.put("/changeJobStatusToOpen/:id", async (req, res, next) => {
  const position = await Position.findByPk(req.params.id);
  if (!position) {
    return res.status(404).send("Position not found");
  }
  position.status = true;
  await position.save();
});

router.get("/singlePosition/:id", async (req, res, next) => {
  try {
    const result = await Position.findByPk(req.params.id, {
      where: { status: true },
      include: Question,
    });
    res.send(result);
  } catch (error) {
    console.log("get REQ ERROR", error);
    next(error);
  }
});

router.post("/addCandidateToPosition/:id", async (req, res) => {
  const position = await Position.findByPk(req.params.id);

  const invite = position.invitations;
  position.invitations = invite + 1;
  await position.save();

  if (!position) {
    return res.status(400).send({ error: "Position not found" });
  }

  const createCandidate = await Candidate.create({
    name: req.body.name,
    email: req.body.email,
    code: req.body.code,
    positionId: position.id,
  });

  res.send({ candidate: createCandidate, position });
});

router.get("/getPositionInvitations/:id", async (req, res) => {
  const position = await Position.findByPk(req.params.id);

  const invitations = position.invitations;

  res.send({ invitations });
});

router.get("/getAllQuestionsFromPosition/:id", async (req, res) => {
  const position = await Position.findByPk(req.params.id, {
    include: Question,
  });

  res.send(position);
});

router.post("/createAnswer", async (req, res) => {
  try {
    const existingAnswer = await Answer.findOne({
      where: {
        questionId: req.body.questionId,
        candidateId: req.body.candidateId,
      },
    });

    if (existingAnswer) {
      await existingAnswer.destroy();
    }

    const createdAnswer = await Answer.create({
      answer: req.body.answer,
      questionId: req.body.questionId,
      candidateId: req.body.candidateId,
    });

    res.send({ answer: createdAnswer });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/renderCandidates/:id", async (req, res) => {
  const candidates = await Position.findByPk(req.params.id, {
    include: Candidate,
  });

  res.send(candidates);
});

router.get("/getCandidateId/:id", async (req, res) => {
  try {
    const candidateId = await Candidate.findAll({
      where: {
        code: req.params.id,
      },
    });

    res.send(candidateId);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/getCandidate/:id", async (req, res) => {
  try {
    const candidateId = await Candidate.findByPk(req.params.id, {
      include: Answer,
    });

    res.send(candidateId);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
