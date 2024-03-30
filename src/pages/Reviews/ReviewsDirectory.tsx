import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Tooltip, OverlayTrigger, Row, Col } from 'react-bootstrap';
import ReviewService from "../../services/ReviewService";
import { ReviewDataDTO } from "../../DTOs/ReviewDataDTO";
import { toast } from "react-toastify";
import {useLocation, useNavigate} from 'react-router-dom';
import ReviewProcessingWizard from "./ReviewProcessingWizard";
import { ReviewDataSimpleDTO } from '../../DTOs/ReviewDataSimpleDTO';

const defaultColumns = ['Select', 'App Name', 'Review ID', 'Review', 'Actions'];

const ReviewsDirectory: React.FC = () => {
    const [selectAll, setSelectAll] = useState(false);
    const [pageData, setPageData] = useState<ReviewDataSimpleDTO[] | null>(null);
    const [wizardData, setWizardData] = useState<ReviewDataSimpleDTO[] | null>(null);
    const [isEditModalOpen, setEditModalIsOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setDeleteModalIsOpen] = useState<boolean>(false);
    const [selectedReview, setSelectedReview] = useState<ReviewDataSimpleDTO | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [isUpdating, setIsUpdating] = useState(false);
    const [review, setReview] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [isScoreValid, setIsScoreValid] = useState(true);
    const [isUpdateButtonClicked, setIsUpdateButtonClicked] = useState(false);
    const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
    const [isWizardModalOpen, setWizardModalOpen] = useState<boolean>(false);
    const location = useLocation();
    const { state } = location;
    const navigate = useNavigate();

    useEffect(() => {
        if (state) {
            const { reviewsData, selectedReviews } = state;
            setPageData(reviewsData);
            setSelectedReviews(selectedReviews);
        }
    }, [state]);
    const openEditModal = (review: ReviewDataSimpleDTO) => {
        setSelectedReview(review);
        setEditModalIsOpen(true);
    };

    const handleSelectAllChange = async () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        if (newSelectAll) {
            const reviewService = new ReviewService();
            try {
                const allReviews = await reviewService.fetchAllReviewsDetailed()
                if (allReviews !== null) {
                    const allReviewIds = pageData?.map(review => review.reviewId) || [];
                    setSelectedReviews(newSelectAll ? allReviewIds : []);
                    setWizardData(newSelectAll ? allReviews.reviews : []);
                } else {
                    console.error('Response from fetch all reviews is null');
                }
            } catch (error) {
                console.error('Error fetching all reviews:', error);
            }
        } else {
            setWizardData([]);
            setSelectedReviews([]);
        }
    };


    const handleCheckboxChange = async (review: ReviewDataSimpleDTO) => {
        setSelectAll(false);

        setSelectedReviews((prevSelectedReviews) => {
            const updatedSelectedReviews = [...prevSelectedReviews];
            const index = updatedSelectedReviews.indexOf(review.reviewId);

            if (index !== -1) {
                updatedSelectedReviews.splice(index, 1);
            } else {
                updatedSelectedReviews.push(review.reviewId);
            }

            return updatedSelectedReviews;
        });

        setWizardData((prevWizardData) => {
            if (!prevWizardData || prevWizardData.length === 0) {
                return [review];
            } else if (!prevWizardData.some((r) => r.reviewId === review.reviewId)) {
                return [...prevWizardData, review];
            } else {
                return prevWizardData.filter((r) => r.reviewId !== review.reviewId);
            }
        });
    };
    const openDeleteModal = (review: ReviewDataSimpleDTO) => {
        setSelectedReview(review);
        setDeleteModalIsOpen(true);
    };

    const closeModals = () => {
        setEditModalIsOpen(false);
        setDeleteModalIsOpen(false);
        setSelectedReview(null);
    };


    useEffect(() => {
        const fetchDataFromApi = async () => {
            const reviewService = new ReviewService();
            try {
                const response = await reviewService.fetchAllReviewsPaginated(currentPage);
                if (response !== null) {
                    const { reviews: mappedData, total_pages: pages } = response;
                    setPageData(mappedData);
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
            const response = await reviewService.fetchAllReviewsPaginated();
            if (response !== null) {
                const { reviews: mappedData, total_pages: pages } = response;
                if (mappedData !== undefined) {
                    setPageData(mappedData);
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

    const nextPage = async () => {
        if (currentPage < totalPages) {
            const nextPageNumber = currentPage + 1;
            setCurrentPage(nextPageNumber);
        }
    };

    const prevPage = async () => {
        if (currentPage > 1) {
            const prevPageNumber = currentPage - 1;
            setCurrentPage(prevPageNumber);
        }
    };

    const analyzeReviewAction = (review: ReviewDataSimpleDTO) => {
        navigate(`/reviews/${review.reviewId}/analyze`);
    };

    const truncateReview = (review: string) => {
        return review.length > 50 ? `${review.substring(0, 50)}...` : review;
    };
    const fetchDataFromApi = async () => {
        const reviewService = new ReviewService();
        try {
            const response = await reviewService.fetchAllReviewsPaginated(currentPage);
            if (response !== null) {
                const { reviews: mappedData, total_pages: pages } = response;
                setPageData(mappedData);
                setTotalPages(pages);
            } else {
                console.error('Response from fetch all reviews is null');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleWizardClose = () => {
        setWizardModalOpen(false);
        fetchDataFromApi();
    };

    return (
        <div>
            <div>
                <h1 className="text-secondary">Reviews</h1>
                {pageData && pageData.length === 0 && (
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
                {pageData && pageData.length > 0 && (
                    <>
                        <Table className="table table-bordered table-centered table-striped table-hover mt-4">
                            <thead>
                                <tr>
                                    <th className="text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAllChange}
                                        />
                                    </th>
                                    {defaultColumns.slice(1).map(column => (
                                        <th className="text-center" key={column}>{column}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pageData && pageData.map(review => (
                                    <tr key={review.reviewId}>
                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedReviews.includes(review.reviewId)}
                                                onChange={() => handleCheckboxChange(review)}
                                            />
                                        </td>
                                        <td className="text-center">{review.app_name || 'N/A'}</td>
                                        <td className="text-center">{review.reviewId || 'N/A'}</td>
                                        <td className="text-center">{truncateReview(review.review) || 'N/A'}
                                            <br/>
                                            {review.review && review.review.length > 50 &&
                                                <Button variant="link" onClick={() => openEditModal(review)}>Read More</Button>}
                                        </td>

                                        <td className="text-end" style={{ width: "150px" }}>

                                                <OverlayTrigger overlay={<Tooltip id="analyze-tooltip">Analyze Review</Tooltip>}>
                                                    <a href="javascript:void(0)" className="action-icon" onClick={() => analyzeReviewAction(review)}>
                                                        <i className="mdi mdi-eye"></i>
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
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center align-items-center">
                                <nav>
                                    <ul className="pagination pagination-rounded mb-0">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <Button className="btn-primary page-link" onClick={prevPage} aria-label="Previous">
                                                <span aria-hidden="true">&laquo;</span>
                                            </Button>
                                        </li>

                                        {currentPage > 6 && (
                                            <li className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                                                <Button className="btn-primary page-link" onClick={() => setCurrentPage(1)}>
                                                    1
                                                </Button>
                                            </li>
                                        )}

                                        {currentPage > 6 && (
                                            <li className="page-item disabled">
                                                <Button className="btn-primary page-link" disabled>
                                                    ...
                                                </Button>
                                            </li>
                                        )}

                                        {Array.from({ length: Math.min(10, totalPages - Math.max(1, currentPage - 5)) }, (_, index) => (
                                            <li key={index} className={`page-item ${currentPage === index + Math.max(1, currentPage - 5) ? 'active' : ''}`}>
                                                <Button className="btn-primary page-link" onClick={() => setCurrentPage(index + Math.max(1, currentPage - 5))}>
                                                    {index + Math.max(1, currentPage - 5)}
                                                </Button>
                                            </li>
                                        ))}

                                        {totalPages - currentPage > 5 && (
                                            <li className="page-item disabled">
                                                <Button className="btn-primary page-link" disabled>
                                                    ...
                                                </Button>
                                            </li>
                                        )}

                                        <li className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
                                            <Button className="btn-primary page-link" onClick={() => setCurrentPage(totalPages)}>
                                                {totalPages}
                                            </Button>
                                        </li>
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <Button className="btn-primary page-link" onClick={nextPage} aria-label="Next">
                                                <span aria-hidden="true">&raquo;</span>
                                            </Button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                        {wizardData && wizardData.length > 0 && (
                            <div className="d-flex justify-content-end mt-2">
                                <Button variant="primary" onClick={() => setWizardModalOpen(true)}>
                                    Process Reviews
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>


            <Modal show={isDeleteModalOpen} backdrop="static" keyboard={false} onHide={closeModals}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete App</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReview && <p>Do you really want to <b>delete</b> the review: {selectedReview?.reviewId}?</p>}
                    <p>This step is <b>irreversible</b></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModals}>Close</Button>
                    <Button variant="danger" onClick={() => deleteReview(selectedReview?.app_id, selectedReview?.reviewId)}>Delete</Button>
                </Modal.Footer>
            </Modal>

            {isWizardModalOpen && (
                <ReviewProcessingWizard
                    reviewsData={wizardData || []}
                    selectedReviews={selectedReviews}
                    onHide={handleWizardClose}
                    onDiscardReview={(review) => {
                        const updatedSelectedReviews = selectedReviews.filter((id) => id !== review.reviewId);
                        setSelectedReviews(updatedSelectedReviews);
                    }}
                    onUpdateDirectory={fetchDataFromApi}
                />
            )}

        </div>

    );
};

export default ReviewsDirectory;
