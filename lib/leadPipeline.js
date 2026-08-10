const PIPELINE = [
  { key: 'new',            label: 'Enquiry submitted'    },
  { key: 'accepted',       label: 'Accepted by designer' },
  { key: 'won',            label: 'Project confirmed'    },
];

function getStageIndex(status) {
  if (status === 'lost' || status === 'cancelled') return -1;
  return PIPELINE.findIndex((s) => s.key === status);
}

module.exports = { PIPELINE, getStageIndex };
