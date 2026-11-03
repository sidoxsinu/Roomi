const { describe, it } = require('node:test');
const assert = require('node:assert');
const { PETS, applyPetState } = require('../src/renderer/character/pets');

describe('Multi-Pet Character System', () => {
  const expectedPetIds = ['blob', 'cat', 'penguin', 'robot'];

  it('provides all 4 open-source pet definitions', () => {
    for (const id of expectedPetIds) {
      assert.ok(PETS[id], `Pet definition for ${id} must exist`);
      assert.strictEqual(PETS[id].id, id);
      assert.ok(PETS[id].name && PETS[id].name.length > 0);
      assert.ok(PETS[id].description && PETS[id].description.length > 0);
      assert.ok(PETS[id].svg && PETS[id].svg.includes('<svg'));
    }
  });

  it('includes required visual components in each pet SVG', () => {
    for (const id of expectedPetIds) {
      const svg = PETS[id].svg;
      assert.ok(svg.includes('class="pet-body"'), `${id} must contain .pet-body`);
      assert.ok(svg.includes('class="foot'), `${id} must contain .foot`);
      assert.ok(svg.includes('class="mouth'), `${id} must contain .mouth`);
      assert.ok(svg.includes('class="eyes-normal"'), `${id} must contain .eyes-normal`);
      assert.ok(svg.includes('class="eyes-sleeping"'), `${id} must contain .eyes-sleeping`);
    }
  });

  it('safely handles state mapping without DOM errors', () => {
    // Simulated minimal DOM element
    const mockElement = {
      querySelector: () => ({
        setAttribute: () => {},
        style: {}
      }),
      querySelectorAll: () => []
    };

    const states = ['happy', 'hot', 'cold', 'humid', 'dry', 'disconnected', 'sleeping'];
    for (const petId of expectedPetIds) {
      for (const s of states) {
        assert.doesNotThrow(() => {
          applyPetState(mockElement, petId, s);
        }, `applyPetState should not throw for ${petId} in state ${s}`);
      }
    }
  });
});
