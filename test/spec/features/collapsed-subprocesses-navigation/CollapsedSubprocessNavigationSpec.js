import {
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import subprocessNavigationModule from 'lib/features/subprocess-navigation';
import { bootstrapViewer } from '../../../helper';

describe('features - subprocess-navigation', function() {

  var testModules = [
    coreModule,
    subprocessNavigationModule
  ];

  var multiLayerXML = require('./Layered_Processes.bpmn');
  var legacyXML = require('./legacySubprocesses.bpmn');

  beforeEach(bootstrapViewer(multiLayerXML, { modules: testModules }));

  describe('Overlays', function() {

    it('should show overlay on Subprocess with content', inject(function(elementRegistry, overlays) {

      // Given
      var collapsedProcess = elementRegistry.get('collapsedProcess');
      var overlay = overlays.get({ element: collapsedProcess });

      // Then
      expect(overlay).to.exist;
    }));


    it('should not show overlay on Subprocess without content', inject(function(elementRegistry, overlays) {

      // Given
      var collapsedProcess = elementRegistry.get('collapsedProcess_withoutContent');
      var overlay = overlays.get({ element: collapsedProcess });

      // Then
      expect(overlay).to.not.exist;
    }));

  });


  describe('Breadcrumbs', function() {

    it('should not show breadcrumbs in root view', inject(function(canvas) {

      // Given
      var breadcrumbs = canvas.getContainer().querySelector('.bpmnjs-breadcrumbs');

      // Then
      expect(breadcrumbs.classList.contains('djs-element-hidden')).to.be.true;
    }));


    it('should show breadcrumbs in subprocess view', inject(function(canvas) {

      // Given
      var breadcrumbs = canvas.getContainer().querySelector('.bpmnjs-breadcrumbs');

      // When
      canvas.setActivePlane('collapsedProcess');

      // Then
      expect(breadcrumbs.classList.contains('djs-element-hidden')).to.be.false;
    }));


    it('should show execution tree', inject(function(canvas) {

      // Given
      var breadcrumbs = canvas.getContainer().querySelector('.bpmnjs-breadcrumbs');

      // When
      canvas.setActivePlane('collapsedProcess_2');

      // Then
      expectBreadcrumbs(breadcrumbs, ['Root', 'Collapsed Process', 'Expanded Process', 'Collapsed Process 2']);
    }));

  });


  describe('Navigation', function() {

    it('should reset scroll and zoom', inject(function(canvas) {

      // Given
      canvas.scroll({ dx: 500, dy: 500 });
      canvas.zoom(0.5);

      // When
      canvas.setActivePlane('collapsedProcess');

      // Then
      var viewbox = canvas.viewbox();
      expect(viewbox.x).to.eql(0);
      expect(viewbox.y).to.eql(0);
      expect(viewbox.scale).to.eql(1);
    }));


    it('should remember scroll and zoom', inject(function(canvas) {

      // Given
      canvas.scroll({ dx: 500, dy: 500 });
      canvas.zoom(0.5);
      var zoomedAndScrolledViewbox = canvas.viewbox();

      // When
      canvas.setActivePlane('collapsedProcess');
      canvas.setActivePlane('rootProcess');

      // Then
      var newViewbox = canvas.viewbox();
      expect(newViewbox.x).to.eql(zoomedAndScrolledViewbox.x);
      expect(newViewbox.y).to.eql(zoomedAndScrolledViewbox.y);
      expect(newViewbox.scale).to.eql(zoomedAndScrolledViewbox.scale);
    }));

  });


  describe('Legacy Processes', function() {

    beforeEach(bootstrapViewer(legacyXML, { modules: testModules }));

    it('should import collapsed subprocess', inject(function(canvas) {

      // when
      var inlineProcess1 = canvas.getPlane('inlineSubprocess');
      var inlineProcess2 = canvas.getPlane('inlineSubprocess_2');

      // Then
      expect(inlineProcess1).to.exist;
      expect(inlineProcess2).to.exist;
    }));

    it('should move inlined elements to sensible position', inject(function(elementRegistry) {

      // when
      var startEvent = elementRegistry.get('subprocess_startEvent');

      // Then
      expect(startEvent).to.exist;
      expect(startEvent.x).to.equal(180);
      expect(startEvent.y).to.equal(160);
    }));

  });

});


// Util

function expectBreadcrumbs(breadcrumbs, expected) {
  var crumbs = Array.from(breadcrumbs.children).map(function(element) {
    return element.innerText;
  });

  expect(crumbs).to.eql(expected);
}