-- Function to update store average rating and review count
CREATE OR REPLACE FUNCTION update_store_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update store statistics when a review is inserted, updated, or deleted
    IF TG_OP = 'DELETE' THEN
        UPDATE stores 
        SET 
            average_rating = COALESCE((
                SELECT ROUND(AVG(rating)::numeric, 2) 
                FROM reviews 
                WHERE store_id = OLD.store_id
            ), 0),
            total_reviews = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE store_id = OLD.store_id
            )
        WHERE id = OLD.store_id;
        RETURN OLD;
    ELSE
        UPDATE stores 
        SET 
            average_rating = COALESCE((
                SELECT ROUND(AVG(rating)::numeric, 2) 
                FROM reviews 
                WHERE store_id = NEW.store_id
            ), 0),
            total_reviews = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE store_id = NEW.store_id
            )
        WHERE id = NEW.store_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update store rating statistics
CREATE TRIGGER trigger_update_store_rating_on_insert
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_store_rating_stats();

CREATE TRIGGER trigger_update_store_rating_on_update
    AFTER UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_store_rating_stats();

CREATE TRIGGER trigger_update_store_rating_on_delete
    AFTER DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_store_rating_stats();

-- Function to update review helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update review helpful count when helpfulness vote is added, updated, or removed
    IF TG_OP = 'DELETE' THEN
        UPDATE reviews 
        SET helpful_count = (
            SELECT COUNT(*) 
            FROM review_helpfulness 
            WHERE review_id = OLD.review_id AND is_helpful = true
        )
        WHERE id = OLD.review_id;
        RETURN OLD;
    ELSE
        UPDATE reviews 
        SET helpful_count = (
            SELECT COUNT(*) 
            FROM review_helpfulness 
            WHERE review_id = NEW.review_id AND is_helpful = true
        )
        WHERE id = NEW.review_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update review helpful count
CREATE TRIGGER trigger_update_helpful_count_on_insert
    AFTER INSERT ON review_helpfulness
    FOR EACH ROW
    EXECUTE FUNCTION update_review_helpful_count();

CREATE TRIGGER trigger_update_helpful_count_on_update
    AFTER UPDATE ON review_helpfulness
    FOR EACH ROW
    EXECUTE FUNCTION update_review_helpful_count();

CREATE TRIGGER trigger_update_helpful_count_on_delete
    AFTER DELETE ON review_helpfulness
    FOR EACH ROW
    EXECUTE FUNCTION update_review_helpful_count();