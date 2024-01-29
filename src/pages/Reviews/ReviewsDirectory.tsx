import React, { useState, useEffect } from 'react';
import {Table, Button, Modal, Tooltip, OverlayTrigger, Row, Col} from 'react-bootstrap';

import ReviewService from "../../services/ReviewService";
import {ReviewDataDTO} from "../../DTOs/ReviewDataDTO";
import {toast} from "react-toastify";
const defaultColumns = ['App Name', 'Review ID', 'Review', 'Score', 'Date', 'Actions'];


const ReviewsDirectory: React.FC = () => {
    const [data, setData] = useState<ReviewDataDTO[] | null>(null);
    const [isEditModalOpen, setEditModalIsOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setDeleteModalIsOpen] = useState<boolean>(false);
    const [selectedReview, setSelectedReview] = useState<ReviewDataDTO | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [isUpdating, setIsUpdating] = useState(false);
    const [review, setReview] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [isScoreValid, setIsScoreValid] = useState(true); // Set to true initially
    const [isUpdateButtonClicked, setIsUpdateButtonClicked] = useState(false);

    const openEditModal = (review: ReviewDataDTO) => {
        setSelectedReview(review);
        setEditModalIsOpen(true);
    };

    const openDeleteModal = (review: ReviewDataDTO) => {
        setSelectedReview(review);
        setDeleteModalIsOpen(true);
    };

    const closeModals = () => {
        setEditModalIsOpen(false);
        setDeleteModalIsOpen(false);
        setSelectedReview(null);
    };

    async function updateReviewsDirectory(reviewService: ReviewService) {
        const response = await reviewService.fetchAllReviews(currentPage);
        if (response !== null) {
            const { reviews: mappedData, total_pages: pages } = response;
            if (mappedData !== undefined) {
                setData(mappedData);
                setTotalPages(pages);
            }
        }
    }

    useEffect(() => {
        const fetchDataFromApi = async () => {
            const reviewService = new ReviewService();
            try {
                const response = await reviewService.fetchAllReviews(currentPage);
                if (response !== null) {
                    const { reviews: mappedData, total_pages: pages } = response;
                    setData(mappedData);
                    setTotalPages(pages);
                } else {
                    console.error('Response from fetch all reviews is null');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchDataFromApi();
    }, [currentPage]);

    const handleUpdateButtonClick = async (
        reviewData: ReviewDataDTO | null,
        review: string,
        date: string,
        score: number
    ) => {
        setIsUpdateButtonClicked(true);
        if (score < 0 || score > 5) {
            setIsScoreValid(false);
            return;
        }

        setIsScoreValid(true);
        const created = await updateReview(reviewData, review, date, score);
        if (created) {
            closeModals();
        }
    };
    const updateReview = async (
        reviewData: ReviewDataDTO | null,
        review: string,
        date: string,
        score: number
    ) => {
        if (!reviewData) {
            console.error("Review is undefined or null.");
            return false;
        }
        const id = reviewData?.id
        const app_id = reviewData?.app_id
        const app_name = reviewData?.app_name
        setIsUpdating(true);

        const reviewService = new ReviewService();
        try {
            await reviewService.updateReview({
                app_name,
                app_id,
                id,
                review,
                score,
                date
            });
            setEditModalIsOpen(false);
            await updateReviewsDirectory(reviewService);
            toast.success('Review updated successfully!');
            setIsUpdating(false);
            return true;
        } catch (error) {
            toast.error('Error updating app');
            console.error("Error updating app:", error);
            return false;
        } finally {
            setIsUpdating(false);
        }
    };


    const deleteReview = async (app_id: string | undefined, review_id: string | undefined) => {
        if (!app_id) {
            console.error("App ID is undefined or null.");
            return false;
        }

        if (!review_id) {
            console.error("Review ID is undefined or null.");
            return false;
        }

        const reviewService = new ReviewService();
        try {
            await reviewService.deleteReview(app_id, review_id);
            const response = await reviewService.fetchAllReviews();
            if (response !== null) {
                const { reviews: mappedData, total_pages: pages } = response;
                if (mappedData !== undefined) {
                    setData(mappedData);
                    setTotalPages(pages);
                }
            }
            toast.success('Review deleted successfully!');
            setDeleteModalIsOpen(false);
            return true;
        } catch (error) {
            toast.error('Error deleting app');
            console.error("Error deleting app:", error);
            setDeleteModalIsOpen(false);
            return false;
        }
    };

    return (
        <div>
            <div>
                <h1 className="text-secondary">Reviews</h1>
                {data && data.length === 0 && (
                    <div className="d-flex justify-content-center align-items-center">
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                            <Row className="text-center">
                                <Col>
                                    <i className="mdi mdi-emoticon-sad text-secondary" style={{ fontSize: '5rem' }} />
                                    <h2>No reviews uploaded yet.</h2>
                                    <p>Why don't you write down some reviews?</p>
                                    <Button className="btn-secondary" href="apps"><i className="mdi mdi-eye"/> View Apps</Button>
                                </Col>
                            </Row>
                        </div>
                    </div>
                )}
                {data && data.length > 0 && (
                    <Table className="table table-bordered table-centered table-striped table-hover mt-4">
                        <thead>
                        <tr>
                            {defaultColumns.map(column => (
                                <th className="text-center" key={column}>{column}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {data && data.map(review => (
                            <tr key={review.id}>
                                <td className="text-center">{review.app_name || 'N/A'}</td>
                                <td className="text-center">{review.id || 'N/A'}</td>
                                <td className="text-center">{review.review || 'N/A'}</td>
                                <td className="text-center">{review.score || 'N/A'}</td>
                                <td className="text-center">{review.date || 'N/A'}</td>
                                <td className="text-end" style={{ width: "150px" }}>
                                    <OverlayTrigger overlay={<Tooltip id="edit-tooltip">Edit</Tooltip>}>
                                        <a href="#" className="action-icon" onClick={() => openEditModal(review)}>
                                            <i className="mdi mdi-pencil"></i>
                                        </a>
                                    </OverlayTrigger>
                                    <OverlayTrigger overlay={<Tooltip id="delete-tooltip">Delete</Tooltip>}>
                                        <a href="#" className="action-icon" onClick={() => openDeleteModal(review)}>
                                            <i className="mdi mdi-delete"></i>
                                        </a>
                                    </OverlayTrigger>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                )}
            </div>


            {/* Edit Modal */}
            <Modal show={isEditModalOpen} backdrop="static" keyboard={false} onHide={closeModals}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit App</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-8">
                            <div className="mb-3">
                                <label htmlFor="appName" className="form-label">App Name</label>
                                <input type="text" id="appName" className="form-control" defaultValue={selectedReview?.app_name} readOnly />
                            </div>
                        </div>
                    </div>
                    <div className="row" >
                        <div className="mb-3">
                            <label htmlFor="reviewID" className="form-label">Review ID</label>
                            <input type="text" id="reviewID" className="form-control" defaultValue={selectedReview?.id} readOnly />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="review" className="form-label">Review</label>
                            <input type="text" id="review" className="form-control" defaultValue={selectedReview?.review} onChange={(e) => setReview(e.target.value)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="appReleaseDate" className="form-label">Date</label>
                                <input className="form-control" id="example-date" type="date" defaultValue={selectedReview?.date} onChange={(e) => setDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="reviewScore" className="form-label">Score</label>
                                <input
                                    type="number"
                                    id="score"
                                    className="form-control"
                                    defaultValue={selectedReview?.score}
                                    min={0}
                                    max={5}
                                    placeholder="Enter a score between 0 and 5"
                                    onChange={(e) => setScore(e.target.valueAsNumber)}
                                />
                                {!isScoreValid && isUpdateButtonClicked  && <div className="invalid-feedback">Score between 0 & 5</div>}
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModals}>Close</Button>
                    <Button
                        variant="primary"
                        onClick={() =>
                            handleUpdateButtonClick(
                                selectedReview,
                                review,
                                date,
                                score,
                            )
                        }
                        disabled={isUpdating}
                    >
                        Update
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={isDeleteModalOpen} backdrop="static" keyboard={false} onHide={closeModals}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete App</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReview && <p>Do you really want to <b>delete</b> the review: {selectedReview?.id}?</p>}
                    <p>This step is <b>irreversible</b></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModals}>Close</Button>
                    <Button variant="danger" onClick={() => deleteReview(selectedReview?.app_id, selectedReview?.id)}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReviewsDirectory;
