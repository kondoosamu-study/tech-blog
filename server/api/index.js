const express = require('express');
const router = express.Router();
const connection = require('../mysql');
const util = require('util');
const query = util.promisify(connection.query).bind(connection);


let allCategoriesQuery = `SELECT * FROM categories;`;
let allTagsQuery = `SELECT * FROM tags;`;
let allSeriesQuery = `SELECT * FROM series;`;
let searchCategoryQuery = `SELECT * FROM categories WHERE name LIKE "CATEGORY_NAME";`;
let insertNewCategoryQuery = `INSERT INTO categories (name) VALUES ("CATEGORY_NAME");`;
let searchThumbnailQuery = `SELECT * FROM thumbnails WHERE name LIKE "THUMBNAIL_NAME";`;
let searchTagQuery = `SELECT * FROM tags WHERE name LIKE "TAG_NAME";`;
let insertNewTagQuery = `INSERT INTO tags (name) VALUES ("TAG_NAME");`;
let searchSeriesQuery = `SELECT * FROM series WHERE name LIKE "SERIES_NAME";`;
let insertNewSeriesQuery = `INSERT INTO series (name) VALUES ("SERIES_NAME");`;
let insertNewArticleQuery = `INSERT INTO articles (title, category_id, contents, thumbnail_id, series_id, series_order, created_at, updated_at) 
VALUES ("TITLE", CATEGORY_ID, 'CONTENTS', THUMBNAIL_ID, SERIES_ID, SERIES_ORDER, "CREATED_AT", "UPDATED_AT");`;
let insertNewArticlesTagsQuery = `INSERT INTO articles_tags (article_id, tag_id) VALUES (ARTICLE_ID, TAG_ID)_CONTINUE_COMMA;`;
// let updateArticlesContentsSingleQuote = `UPDATE articles SET contents=REPLACE(contents, "SINGLE_QUOTE", "'") WHERE id=ARTICLE_ID;`;
// let updateArticlesContentsSingleQuote = `UPDATE articles SET contents=REPLACE(REPLACE(contents, "SINGLE_QUOTE", "'"), "BACKSLASH", "\\") WHERE id=ARTICLE_ID;`;
let updateArticlesContentsSingleQuote = `UPDATE articles SET contents=REPLACE(REPLACE(contents, "SINGLE_QUOTE", "'"), "DOUBLE_QUOTE", '"') WHERE id=ARTICLE_ID;`;

router.get('/articles', (req, res) => {
	connection.query(allSeriesQuery, (err, result) => {
		if (err) {
			console.log(" Error query =======", err);
			return next(err);
		}
		res.json(result);
	})
});

router.get('/category', (req, res) => {
	connection.query(allCategoriesQuery, (err, result) => {
		if (err) {
			console.log(" Error query =======", err);
			return next(err);
		}
		res.json(result);
	})
});

router.get('/tag', (req, res) => {
	connection.query(allTagsQuery, (err, result) => {
		if (err) {
			console.log(" Error query =======", err);
			return next(err);
		}
		res.json(result);
	})
});

router.get('/series', (req, res) => {
	connection.query(allSeriesQuery, (err, result) => {
		if (err) {
			console.log(" Error query =======", err);
			return next(err);
		}
		res.json(result);
	})
});

// 記事登録API
router.post('/new-article', async (req, res) => {
	let categoryResult;
	let thumbnailResult;
	let searchTagQueryForExecution;
	let insertNewTagQueryForExecution;
	let tagsResult = [];
	let seriesResult;
	let articleResult;

	try {
		let queryParameter = req.body.params;
		console.log('queryParameter', queryParameter);

		// 【category】
		searchCategoryQuery = searchCategoryQuery.replace('CATEGORY_NAME', queryParameter.category);
		const categoryRecord = await query(searchCategoryQuery);
		// 値が存在する場合
		// 値
		// rows [ RowDataPacket { id: 3, name: 'Linux' } ]
		// 型
		// object
		// 値が存在しない場合
		// 値
		// rows []
		// 型
		// object
		console.log('categoryRecordのtype', typeof (categoryRecord));
		console.log('categoryRecord のkeys === ', Object.keys(categoryRecord));
		console.log('categoryRecord ==== ', categoryRecord);

		if (!Object.keys(categoryRecord).length) {
			insertNewCategoryQuery = insertNewCategoryQuery.replace('CATEGORY_NAME', queryParameter.category);
			const insertCategory = await query(insertNewCategoryQuery);
			let { insertId } = insertCategory;
			categoryResult = { id: insertId, name: queryParameter.category };

		} else {
			let { id, name } = categoryRecord[0];
			categoryResult = { id: id, name: name };
		}
		console.log('categoryResult ======', categoryResult);

		// 【thumbnail】
		searchThumbnailQuery = searchThumbnailQuery.replace('THUMBNAIL_NAME', queryParameter.thumbnailName);
		const thumbnailRecord = await query(searchThumbnailQuery);
		console.log('thumbnailRecord ==== ', thumbnailRecord);
		console.log('thumbnailRecord のkeys === ', Object.keys(thumbnailRecord));

		let { id, name, url, full_path } = thumbnailRecord[0];
		thumbnailResult = { id: id, name: name, url: url, full_path: full_path };

		// 【tags】
		for (let tag of queryParameter.tags) {
			console.log('tag === ', tag);
			// tagRecord = '';
			searchTagQueryForExecution = searchTagQuery;

			searchTagQueryForExecution = searchTagQueryForExecution.replace('TAG_NAME', tag);
			let tagRecord = await query(searchTagQueryForExecution);
			console.log('tagRecord === ', tagRecord);

			if (!Object.keys(tagRecord).length) {
				insertNewTagQueryForExecution = insertNewTagQuery;

				insertNewTagQueryForExecution = insertNewTagQueryForExecution.replace('TAG_NAME', tag);
				let insertTag = await query(insertNewTagQueryForExecution);
				let { insertId } = insertTag;
				tagsResult.push({ id: insertId, name: tag });

			} else {
				let { id, name } = tagRecord[0];
				tagsResult.push({ id: id, name: name });
			}
		}

		// 【series】
		if (queryParameter.seriesName.length) {
			searchSeriesQuery = searchSeriesQuery.replace('SERIES_NAME', queryParameter.seriesName);
			const seriesRecord = await query(searchSeriesQuery);
			
			console.log('seriesRecordのtype', typeof (seriesRecord));
			console.log('seriesRecord のkeys === ', Object.keys(seriesRecord));
			console.log('seriesRecord ==== ', seriesRecord);

			if (!Object.keys(seriesRecord).length) {
				insertNewSeriesQuery = insertNewSeriesQuery.replace('SERIES_NAME', queryParameter.seriesName);
				const insertSeries = await query(insertNewSeriesQuery);
				let { insertId } = insertSeries;
				seriesResult = { id: insertId, name: queryParameter.seriesName };

			} else {
				let { id, name } = seriesRecord[0];
				seriesResult = { id: id, name: name };
			}
		} else {
			seriesResult = { id: null, name: null };
		}

		// 【articles】
		console.log("before contents ==== ", queryParameter.contents);
		let contents = queryParameter.contents.replace(/\'/g, 'SINGLE_QUOTE').replace(/\"/g, 'DOUBLE_QUOTE');
		// let contents = queryParameter.contents.replace(/\'/, 'SINGLE_QUOTE').replace(/\\/, '\\\\');
		console.log("after contents ==== ", contents);
		
		insertNewArticleQuery = insertNewArticleQuery.replace('TITLE', queryParameter.title)
			.replace('CATEGORY_ID', categoryResult.id)
			.replace('CONTENTS', contents)
			.replace('THUMBNAIL_ID', thumbnailResult.id)
			.replace('SERIES_ID', seriesResult.id)
			.replace('SERIES_ORDER', queryParameter.seriesOrder)
			.replace('CREATED_AT', queryParameter.createdAt)
			.replace('UPDATED_AT', queryParameter.updatedAt);
		const insertArticles = await query(insertNewArticleQuery);
		let { insertId } = insertArticles;
		articleResult = { id: insertId };

		// 【articles_tags】
		for (let tag of tagsResult) {
			insertNewArticlesTagsQuery = insertNewArticlesTagsQuery.replace('ARTICLE_ID', articleResult.id).replace('TAG_ID', tag.id).replace('_CONTINUE_COMMA', ', (ARTICLE_ID, TAG_ID)_CONTINUE_COMMA');
		}
		insertNewArticlesTagsQuery = insertNewArticlesTagsQuery.replace(', (ARTICLE_ID, TAG_ID)_CONTINUE_COMMA', '');
		await query(insertNewArticlesTagsQuery);

		// 【articlesテーブルのcontentsカラムに存在するシングルクォート文字列を'に変換する】
		updateArticlesContentsSingleQuote = updateArticlesContentsSingleQuote.replace('ARTICLE_ID', articleResult.id);
		await query(updateArticlesContentsSingleQuote);

		res.json(true);
	} catch (err) {
		console.log(err);
		
	} finally {
		connection.end();
	}
});

module.exports = router;