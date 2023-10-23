import setup from '@boardzilla/core/game';

export default setup({
  playerClass: ...,
  boardClass: ...,
  elementClasses: [ .. ],
  setupBoard: (game, board) => { },
  actions: (_, board) => { },
  setupFlow: (game, board) => { },
  setupLayout: (board, aspectRatio) => { },

})