

kaboom({
    global: true,
    fullscreen: true,
    scale: 1.5,
    debug: true,
    clearColor: [0, 0, 0, 1],
})

//NEED TO FIX ALL PATHS FROM IMGR
loadSprite('coin', 'https://i.imgur.com/HfAgzM7.png')
loadSprite('evil-shroom', 'https://i.imgur.com/eurBJil.png')
loadSprite('brick', 'https://i.imgur.com/Yv4xMb9.png')
loadSprite('block', 'https://i.imgur.com/Yv4xMb9.png')
loadSprite('blue-block', 'https://i.imgur.com/3WimAET.png')
loadSprite('mario', 'https://i.imgur.com/WHkpuPd.png')
loadSprite('mushroom', 'https://i.imgur.com/NiaMjSx.png')
loadSprite('surprise', 'https://i.imgur.com/h8tOeEi.png')
loadSprite('unboxed', 'https://i.imgur.com/F5GSGl8.png')
loadSprite('pipe-top-left', 'https://i.imgur.com/FzCowMz.png')
loadSprite('pipe-top-right', 'https://i.imgur.com/dce5Bhe.png')
loadSprite('pipe-bottom-left', 'https://i.imgur.com/PxqAfkV.png')
loadSprite('pipe-bottom-right', 'https://i.imgur.com/E3DKeqH.png')


const MOVE_SPEED = 120
const JUMP_FORCE = 360
const BIG_JUMP_FORCE = 500
let CURRENT_JUMP_FORCE = JUMP_FORCE
let isJumping = true
const FALL_DEATH = 800

scene("game", ({ level, score }) => {
    layers(['bg', 'obj', 'ui'], 'obj')

    const maps = [
        
        [
            '                                                 ',
            '                                                 ',
            '                                                 ',
            '=                                                ',
            '=                                                ',
            '=                                                ',
            '=                                                ',
            '=         %  =*=%=                               ',
            '=                                         =      ',
            '=                                      -+ =      ',
            '=           x            x             () =      ',
            '=============================      ========      '
        ],
        
        [
            '                                                                                      ',
            '                                                                                      ',
            '                                                                                      ',
            '=                                               =*=%=                                 ',
            '=                                                                                     ',
            '=                                        ==                                           ',
            '=                                     ==      ============                            ',
            '=         %                        ==                      ==                         ',
            '=                    ==%=       ==                            ==                  =   ',
            '=                            ==                                  ===           -+ =   ',
            '=                       x                                            ===       () =   ',
            '=============================                                           ===========    '
        ],


        [
            '&                                   &',
            '&                                   &',
            '&                                   &',
            '&                                   &',
            '&                                   &',
            '&                                   &',
            '&                                   &',
            '&                                   &',
            '&                          &        &',
            '&                         &&      -+&',
            '&           x       x    &&&      ()&',
            '&&&&&&&&&&&&&&&&&&&&&&&&&&&&   &&&&&&'
        ]
      ]

    const levelCfg = {
        width: 20,
        height: 20,
        '=': [sprite('block'), solid()],
        '&': [sprite('blue-block'), solid(), scale(0.5)],
        'x': [sprite('evil-shroom'), solid(), 'dangerous'],
        '~': [sprite('coin'), 'coin'],
        '%': [sprite('surprise'), solid(), 'coin-surprise'],
        '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
        '}': [sprite('unboxed'), solid()],
        '(': [sprite('pipe-bottom-left'), solid(), scale(0.5),],
        ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
        '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
        '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
        '#': [sprite('mushroom'), 'mushroom', body()],
    }

    const gameLevel = addLevel(maps[level], levelCfg)

    const scoreLabel = add([
        text('score: ' + score), pos(30, 6), layer('ui'), {value: score}
      ])

      add([text('level: ' + parseInt(level + 1) ), pos(100, 6)])

      function big() {
        let timer = 0
        let isBig = false
        return {
          update() {
            if (isBig) {
              CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
              timer -= dt()
              if (timer <= 0) {
                this.smallify()
              }
            }
          },
          isBig() {
            return isBig
          },
          smallify() {
            this.scale = vec2(1)
            CURRENT_JUMP_FORCE = JUMP_FORCE
            timer = 0
            isBig = false
          },
          biggify(time) {
            this.scale = vec2(2)
            timer = time
            isBig = true     
          }
        }
      }

    const player = add([
        sprite('mario'), solid(),
        pos(30,0),
        body(),
        big(),
        origin('bot')
    ])

    action('mushroom', (m) => {
        m.move(25,0)
    })

    player.on("headbump", (obj) => {
        if(obj.is('coin-surprise')) {
            gameLevel.spawn('~', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0, 0))
        }

        if(obj.is('mushroom-surprise')) {
            gameLevel.spawn('#', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0, 0))
        }
    })

    player.collides('mushroom', (m) => {
        destroy(m)
        player.biggify(6)
    })

    player.collides('coin', (c) => {
        destroy(c)
        scoreLabel.value++
        scoreLabel.text = 'score: ' + scoreLabel.value
    })


    const ENEMY_SPEED = 20

    action('dangerous', (d) => {
        d.move(-ENEMY_SPEED, 0)
    })

    player.collides('dangerous', (d) => {
        if (isJumping) {
            destroy(d)
            scoreLabel.value++
            scoreLabel.text = 'score: ' + scoreLabel.value
        }
        else {
            go('lose', { score: scoreLabel.value})
        }
    })

    player.action(() => {
        camPos(player.pos)
        if (player.pos.y >= FALL_DEATH) {
            go('lose', { score: scoreLabel.value})
        }
    })

    player.collides('pipe', () => {
        keyPress('down', () => {
            go('game', { level: (level + 1) % maps.length, score: scoreLabel.value})
        })
    })

    keyDown('left', () => {
        player.move(-120, 0)
    })
    
    keyDown('right', () => {
        player.move(120, 0)
    })

    keyDown('a', () => {
        player.move(-120, 0)
    })
    
    keyDown('d', () => {
        player.move(120, 0)
    })

    player.action(() => {
        if (player.grounded()){
            isJumping = false
        }
    })

    keyPress('space', () => {
        if(player.grounded()) {
            isJumping = true
            player.jump(CURRENT_JUMP_FORCE)
        }
    })
    
    keyPress('w', () => {
        if(player.grounded()) {
            player.jump(CURRENT_JUMP_FORCE)
        }
    })

    
})

scene('lose', ({ score }) => {
    add([text(score, 32), origin('center'), pos(width()/2, height()/ 2)])
  })

  start("game",  { level: 0, score: 0 })