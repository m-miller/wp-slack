/**
 * External dependencies
 */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import config from 'config';
import test from 'selenium-webdriver/testing';

/**
 * Internal dependencies
 */
import * as testHelper from './lib/test-helper';

chai.use( chaiAsPromised );

const assert = chai.assert;

test.describe( 'notifies slack when a post is published', function() {
	let postTitle;

	this.timeout( config.get( 'mochaTimeoutMs' ) );

	test.before( 'create integration', () => {
		testHelper.createIntegration();
		testHelper.enablePostIsPublished();
	} );

	test.describe( 'integration is active', () => {
		test.before( 'create post', () => {
			postTitle = 'Test post ' + new Date().getTime();
			testHelper.publishPost( postTitle );
		} );

		test.it( 'should matches latest slack message with latest post title', () => {
			assert.eventually.match( testHelper.getLatestSlackMessage(), new RegExp( postTitle ) );
		} );

		test.after( 'trash post', () => {
			testHelper.trashPost( postTitle );
		} );
	} );

	test.describe( 'integration is not active', () => {
		test.before( 'deactivate integration', () => {
			testHelper.deactivateIntegration();
		} );

		test.before( 'create post', () => {
			postTitle = 'Test post ' + new Date().getTime();
			testHelper.publishPost( postTitle );
		} );

		test.it( 'should not match latest slack message with latest post title', () => {
			assert.eventually.notMatch( testHelper.getLatestSlackMessage(), new RegExp( postTitle ) );
		} );

		test.after( 'trash post', () => {
			testHelper.trashPost( postTitle );
		} );
	} );

	test.after( 'trash integration', () => {
		testHelper.trashIntegrationViaList();
	} );
} );
