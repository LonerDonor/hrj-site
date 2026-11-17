// The three work domains: labels, placeholder drawing (`kind` for {% media %}),
// icon, hero eyebrow modifier, /work/ index blurb, enquiry `topic` (a
// services.yml topic value) and the case-study CTA heading.
// Global data (`domains`); src/work/work.11tydata.js re-exports it as
// `workDomains`. Colours per domain come from main.css ([data-domain]).
export default {
  water: {
    label: "Water engineering",
    noun: "water engineering",
    kind: "water",
    icon: "water",
    eyebrow: "eyebrow--water",
    blurb: "Groundwater, canals and stone spouts",
    topic: "groundwater",
    cta: "Planning a recharge study or a new <em>spout</em>?",
  },
  heritage: {
    label: "Heritage",
    noun: "heritage",
    kind: "heritage",
    icon: "heritage",
    eyebrow: "eyebrow--heritage",
    blurb: "Hiti research, sculpture and walks",
    topic: "heritage-engineering",
    cta: "Restoring a spout or documenting a <em>site</em>?",
  },
  education: {
    label: "Education",
    noun: "education",
    kind: "robotics",
    icon: "robot",
    eyebrow: "",
    blurb: "Robotics in public schools",
    topic: "education",
    cta: "Bringing robotics into your <em>school</em>?",
  },
};
