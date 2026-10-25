/* Sample lessons for the interactive preview on the homepage.
   These are pre-written to show how grade level and format change a lesson.
   The ShikhaAI app writes a new lesson for any topic the learner types. */
window.SHIKHA_LESSONS = {
  sky: {
    title: 'Why is the sky blue?',
    scenes: [
      { icon: 'sun', caption: 'Sunlight holds every color' },
      { icon: 'wind', caption: 'Light meets the air' },
      { icon: 'waves', caption: 'Short waves scatter most' },
      { icon: 'eye', caption: 'Blue reaches our eyes' },
    ],
    script: {
      elementary: 'Sunlight looks white, but it is really every color mixed together. When sunlight bumps into the tiny bits of air in the sky, blue light bounces around the most. That bouncing blue light comes at us from every direction, so the whole sky looks blue.',
      middle: 'White sunlight is a mix of all the colors of the rainbow, and each color travels as a wave of a different length. Air molecules scatter short wavelengths, like blue, much more than long ones, like red. That scattered blue light reaches your eyes from all over the sky, which is why it looks blue.',
      high: 'Sunlight contains a continuous spectrum of visible wavelengths. Nitrogen and oxygen molecules are far smaller than those wavelengths, so they scatter light by Rayleigh scattering, whose intensity scales with one over the wavelength to the fourth power. Blue light is scattered about five times more strongly than red, filling the sky with diffuse blue light.',
    },
    podcast: {
      elementary: [
        'Echo, quick question. Why is the sky blue and not, like, green?',
        'Sunlight has every color in it. The tiny bits of air bounce blue light around the most, so blue comes at us from everywhere.',
      ],
      middle: [
        'Okay, if sunlight is white, where does all that blue come from?',
        'Air molecules scatter short wavelengths far more than long ones. Blue gets spread across the whole sky, so that is what we see when we look up.',
      ],
      high: [
        'Here is what bugs me. Violet scatters even more than blue, so why is the sky not violet?',
        'Good catch. Sunlight has less violet to begin with, and our eyes are far more sensitive to blue. Rayleigh scattering plus human biology gives you a blue sky.',
      ],
    },
  },

  volcano: {
    title: 'How do volcanoes erupt?',
    scenes: [
      { icon: 'mountain', caption: 'A mountain with a secret' },
      { icon: 'layers', caption: 'Deep under the crust' },
      { icon: 'flame', caption: 'Magma starts to rise' },
      { icon: 'cloud', caption: 'Gas and lava burst out' },
    ],
    script: {
      elementary: 'Deep under the ground, it is so hot that rock melts into a thick, glowing liquid called magma. Magma is lighter than the solid rock around it, so it slowly pushes its way up. When enough magma and gas squeeze up through a crack, the volcano erupts.',
      middle: 'Far below the surface, high temperatures melt rock into magma. Because magma is less dense than the surrounding rock, it rises and collects in a magma chamber. Gases dissolved in the magma build up pressure, and when that pressure becomes too great, magma bursts through the surface as lava.',
      high: 'Magma forms where mantle rock partially melts, often at subduction zones or hotspots. Being less dense than the surrounding rock, it rises and accumulates in crustal magma chambers. As it ascends, falling pressure lets dissolved water vapor and carbon dioxide come out of solution, and the expanding gas drives an eruption whose violence depends largely on the magma’s viscosity.',
    },
    podcast: {
      elementary: [
        'So volcanoes are basically mountains that burp lava?',
        'Kind of! Deep underground, rock gets so hot it melts. That melted rock pushes up and up until it bursts out the top.',
      ],
      middle: [
        'What actually makes a volcano blow?',
        'Pressure. Magma rises because it is lighter than the rock around it, and gas trapped inside builds up until the magma breaks through the surface.',
      ],
      high: [
        'Why do some volcanoes ooze gently while others explode?',
        'Viscosity. Runny basaltic magma lets gas escape easily. Thick, silica-rich magma traps it, so pressure builds until it releases violently.',
      ],
    },
  },

  plants: {
    title: 'How do plants make food?',
    scenes: [
      { icon: 'sun', caption: 'Leaves catch sunlight' },
      { icon: 'droplets', caption: 'Roots bring up water' },
      { icon: 'wind', caption: 'Leaves take in air' },
      { icon: 'sprout', caption: 'Sugar helps it grow' },
    ],
    script: {
      elementary: 'Plants can make their own food. Their leaves catch sunlight, their roots drink up water, and tiny holes in the leaves take in air. The plant uses the energy from sunlight to turn the water and air into sugar, which helps it grow.',
      middle: 'Plants make their own food through photosynthesis. Inside their leaves, a green pigment called chlorophyll absorbs light energy. The plant uses that energy to combine carbon dioxide from the air with water from the soil, producing glucose for energy and releasing oxygen.',
      high: 'Photosynthesis converts light energy into chemical energy. In the thylakoid membranes of the chloroplast, light-dependent reactions split water, release oxygen, and produce ATP and NADPH. The Calvin cycle in the stroma then uses that ATP and NADPH to fix carbon dioxide into sugars.',
    },
    podcast: {
      elementary: [
        'Wait, plants do not eat food like we do?',
        'Nope! They make their own. Leaves catch sunlight and use it to turn water and air into sugar.',
      ],
      middle: [
        'So where does a tree’s mass actually come from? The soil?',
        'Mostly from the air, surprisingly. Through photosynthesis, the tree takes in carbon dioxide and builds it into sugars, using water and light energy.',
      ],
      high: [
        'Give me the two-stage version. What happens inside the chloroplast?',
        'First, light-dependent reactions split water and make ATP and NADPH. Then the Calvin cycle spends those to fix carbon dioxide into sugar.',
      ],
    },
  },

  momentum: {
    title: 'What is momentum?',
    scenes: [
      { icon: 'bike', caption: 'Something on the move' },
      { icon: 'truck', caption: 'More mass, more momentum' },
      { icon: 'gauge', caption: 'More speed, more momentum' },
      { icon: 'rocket', caption: 'Momentum in space' },
    ],
    script: {
      elementary: 'Anything that is moving has momentum. A heavy truck is harder to stop than a bicycle, even when they go the same speed. A fast bike is harder to stop than a slow one, too. Momentum is how much push a moving thing carries with it.',
      middle: 'Momentum describes how hard it is to stop a moving object. It depends on two things: mass and velocity. A skateboarder rolling fast has more momentum than one rolling slowly, and a loaded truck has more momentum than a car at the same speed. We calculate it as mass times velocity.',
      high: 'Linear momentum is defined as p equals m v, a vector that points in the direction of motion. Newton’s second law can be written as force equals the rate of change of momentum. In a closed system with no external forces, total momentum is conserved, which is why a rocket accelerates forward as it pushes exhaust backward.',
    },
    podcast: {
      elementary: [
        'Why is a shopping cart full of groceries so hard to stop?',
        'Because it has lots of momentum! Heavy things and fast things are harder to stop.',
      ],
      middle: [
        'What is harder to stop, a fast baseball or a slow truck?',
        'Usually the truck. Momentum is mass times velocity, and the truck’s huge mass outweighs the ball’s speed.',
      ],
      high: [
        'How does a rocket speed up in space with nothing to push against?',
        'Conservation of momentum. It throws exhaust backward at high speed, so the rocket gains equal momentum forward.',
      ],
    },
  },
};
